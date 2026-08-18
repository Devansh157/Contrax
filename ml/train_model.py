import os
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error, mean_absolute_percentage_error
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.inspection import permutation_importance

from preprocess_data import load_and_merge_data, prepare_feature_matrix

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "contract_amount_model.joblib")

def train_and_evaluate(dataset_dir="dataset"):
    print("=" * 60)
    print(" CONTRACT AMOUNT PREDICTION - MODEL TRAINING & EVALUATION ")
    print("=" * 60)

    # 1. Load and merge datasets
    print("\n[1/5] Loading and engineering dataset features...")
    start_time = time.time()
    df = load_and_merge_data(dataset_dir)
    X, y, cat_cols, num_cols = prepare_feature_matrix(df)
    print(f" Dataset ready in {time.time() - start_time:.2f}s! Rows: {len(df):,}, Features: {X.shape[1]}")

    # 2. Train-Test Split
    print("\n[2/5] Splitting dataset (80% Train, 20% Test)...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f" Train samples: {len(X_train):,}, Test samples: {len(X_test):,}")

    # 3. Create Preprocessor Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), num_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_cols)
        ]
    )

    # Candidate Models
    models = {
        "HistGradientBoostingRegressor (Tuned)": HistGradientBoostingRegressor(
            max_iter=500,
            learning_rate=0.05,
            max_leaf_nodes=63,
            min_samples_leaf=15,
            l2_regularization=0.1,
            random_state=42
        ),
        "RandomForestRegressor": RandomForestRegressor(
            n_estimators=100,
            max_depth=20,
            random_state=42,
            n_jobs=-1
        )
    }

    best_model_name = None
    best_pipeline = None
    best_r2 = -float('inf')
    model_results = {}

    print("\n[3/5] Training and comparing regression candidate models...")
    for name, regressor in models.items():
        print(f"\nTraining model: {name}...")
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', regressor)
        ])

        t0 = time.time()
        pipeline.fit(X_train, y_train)
        fit_time = time.time() - t0

        y_pred = pipeline.predict(X_test)
        r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mape = mean_absolute_percentage_error(y_test, y_pred) * 100

        model_results[name] = {
            'R2': r2,
            'MAE': mae,
            'RMSE': rmse,
            'MAPE (%)': mape,
            'Fit Time (s)': fit_time
        }

        print(f"   Fit Time : {fit_time:.2f}s")
        print(f"   R2 Score : {r2:.6f} ({r2 * 100:.2f}% Accuracy)")
        print(f"   MAE      : Rs. {mae:,.2f}")
        print(f"   RMSE     : Rs. {rmse:,.2f}")
        print(f"   MAPE     : {mape:.2f}%")

        if r2 > best_r2:
            best_r2 = r2
            best_model_name = name
            best_pipeline = pipeline

    # Summary Comparison Table
    print("\n" + "=" * 60)
    print(" MODEL PERFORMANCE SUMMARY ")
    print("=" * 60)
    summary_df = pd.DataFrame(model_results).T
    print(summary_df.to_string())

    # 4. Feature Permutation Importance on Best Model
    print(f"\n[4/5] Computing feature importance for best model ({best_model_name})...")
    sub_sample_X = X_test.iloc[:2000]
    sub_sample_y = y_test.iloc[:2000]
    perm_importance = permutation_importance(best_pipeline, sub_sample_X, sub_sample_y, n_repeats=5, random_state=42)

    sorted_idx = perm_importance.importances_mean.argsort()[::-1]
    print("\n Top 10 Most Important Features:")
    for idx in sorted_idx[:10]:
        print(f"   - {X.columns[idx]:<25}: {perm_importance.importances_mean[idx]:.4f} +/- {perm_importance.importances_std[idx]:.4f}")

    # 5. Save best model artifact
    print(f"\n[5/5] Saving best model pipeline to '{MODEL_SAVE_PATH}'...")
    joblib.dump(best_pipeline, MODEL_SAVE_PATH)
    print(f" Model pipeline successfully saved to {os.path.abspath(MODEL_SAVE_PATH)}")

    # Also save copy in backend/contracts/ml/
    backend_ml_dir = os.path.join(BASE_DIR, "..", "backend", "contracts", "ml")
    os.makedirs(backend_ml_dir, exist_ok=True)
    backend_model_path = os.path.join(backend_ml_dir, "contract_amount_predictor.joblib")
    joblib.dump(best_pipeline, backend_model_path)
    print(f" Model pipeline copy saved to {os.path.abspath(backend_model_path)}")

    # Save metadata JSON
    import json
    metadata = {
        "model_name": best_model_name,
        "r2_score": float(best_r2),
        "accuracy_percentage": round(float(best_r2) * 100, 2),
        "mae": float(model_results[best_model_name]['MAE']),
        "rmse": float(model_results[best_model_name]['RMSE']),
        "top_features": [X.columns[idx] for idx in sorted_idx[:10]]
    }
    metadata_path = os.path.join(backend_ml_dir, "model_metadata.json")
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f" Model metadata saved to {os.path.abspath(metadata_path)}")

    return best_pipeline, summary_df

if __name__ == "__main__":
    train_and_evaluate()

