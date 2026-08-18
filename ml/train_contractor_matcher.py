import os
import time
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def train_matcher(dataset_dir="dataset"):
    print("=" * 60)
    print(" CONTRACTOR MATCHING & RECOMMENDATION ENGINE - TRAINING ")
    print("=" * 60)

    if not os.path.exists(dataset_dir):
        alt_path = os.path.join(BASE_DIR, "..", "dataset")
        if os.path.exists(alt_path):
            dataset_dir = alt_path

    # 1. Load data
    print("\n[1/4] Loading relational datasets...")
    service_reqs = pd.read_csv(os.path.join(dataset_dir, "service_requests.csv"))
    contractors = pd.read_csv(os.path.join(dataset_dir, "contractors.csv"))

    # Filter assigned service requests
    valid_reqs = service_reqs.dropna(subset=['assigned_contractor_id']).copy()

    # Merge service_requests with contractors
    merged = valid_reqs.merge(
        contractors[['contractor_id', 'specialization', 'rating', 'tier', 'years_in_business', 'completion_rate_percent']],
        left_on='assigned_contractor_id',
        right_on='contractor_id',
        how='inner'
    )
    
    print(f" Valid Training Pairs Matched: {len(merged):,}")

    # Fill missing values
    merged['sub_service'] = merged['sub_service'].fillna('General Service')
    merged['priority'] = merged['priority'].fillna('Medium')
    merged['district'] = merged['district'].fillna('Ahmedabad')
    merged['estimated_budget'] = pd.to_numeric(merged['estimated_budget'], errors='coerce').fillna(5000)
    merged['rating'] = pd.to_numeric(merged['rating'], errors='coerce').fillna(4.5)

    categorical_features = ['service_type', 'sub_service', 'district', 'priority']
    numerical_features = ['estimated_budget', 'rating']

    X = merged[categorical_features + numerical_features].copy()
    for col in categorical_features:
        X[col] = X[col].astype(str)

    y = merged['assigned_contractor_id'].astype(str)

    # Train Test Split
    print("\n[2/4] Splitting dataset (80% Train, 20% Test)...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )

    # Models: RandomForest & KNN
    print("\n[3/4] Training candidate classification algorithms...")
    models = {
        "RandomForestClassifier": RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1),
        "KNeighborsClassifier (KNN)": KNeighborsClassifier(n_neighbors=5, weights='distance', n_jobs=-1)
    }

    best_pipeline = None
    best_name = None
    best_top3_acc = 0.0
    results = {}

    for name, clf in models.items():
        t0 = time.time()
        pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('classifier', clf)])
        pipeline.fit(X_train, y_train)
        fit_time = time.time() - t0

        probas = pipeline.predict_proba(X_test)
        classes = pipeline.classes_

        # Calculate top-3 recommendation accuracy
        top3_correct = 0
        y_test_list = y_test.tolist()
        for i, true_val in enumerate(y_test_list):
            top3_indices = np.argsort(probas[i])[-3:]
            top3_classes = classes[top3_indices]
            if true_val in top3_classes:
                top3_correct += 1
        
        top3_acc = top3_correct / len(y_test)
        top1_acc = accuracy_score(y_test, pipeline.predict(X_test))

        results[name] = {'Top-1 Accuracy': top1_acc, 'Top-3 Recommendation Accuracy': top3_acc, 'Fit Time': fit_time}
        print(f"\n Algorithm: {name}")
        print(f"   Fit Time                 : {fit_time:.2f}s")
        print(f"   Top-1 Direct Accuracy    : {top1_acc * 100:.2f}%")
        print(f"   Top-3 Recommendation Acc : {top3_acc * 100:.2f}%")

        if top3_acc > best_top3_acc:
            best_top3_acc = top3_acc
            best_name = name
            best_pipeline = pipeline

    # Save best model pipeline
    print(f"\n[4/4] Saving best matcher model pipeline ({best_name})...")
    root_path = os.path.join(BASE_DIR, "contractor_matcher_model.joblib")
    backend_path = os.path.join(BASE_DIR, "..", "backend", "contracts", "ml", "contractor_matcher.joblib")
    os.makedirs(os.path.dirname(backend_path), exist_ok=True)

    joblib.dump(best_pipeline, root_path)
    joblib.dump(best_pipeline, backend_path)

    meta = {
        "model_name": best_name,
        "top1_accuracy": round(float(results[best_name]['Top-1 Accuracy']) * 100, 2),
        "top3_accuracy": round(float(best_top3_acc) * 100, 2),
        "features": categorical_features + numerical_features
    }
    meta_path = os.path.join(BASE_DIR, "..", "backend", "contracts", "ml", "contractor_matcher_metadata.json")
    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2)

    print(f"\n Model successfully saved to {os.path.abspath(backend_path)}")
    print(f" Metadata saved to {os.path.abspath(meta_path)}")
    return best_pipeline

if __name__ == "__main__":
    train_matcher()
