import os
import joblib
import pandas as pd
import numpy as np
from preprocess_data import load_and_merge_data, prepare_feature_matrix

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "contract_amount_model.joblib")

def load_model(model_path=MODEL_PATH):
    if not os.path.exists(model_path):
        root_fallback = os.path.join(BASE_DIR, "..", "contract_amount_model.joblib")
        if os.path.exists(root_fallback):
            model_path = root_fallback
        else:
            raise FileNotFoundError(f"Saved model file not found at '{model_path}'. Please run 'train_model.py' first.")
    return joblib.load(model_path)

def predict_on_sample(num_samples=10, dataset_dir=r"dataset"):
    model = load_model()
    df = load_and_merge_data(dataset_dir)
    X, y, cat_cols, num_cols = prepare_feature_matrix(df)

    # Sample random contracts
    sample_df = df.sample(n=num_samples, random_state=42).copy()
    sample_X, sample_y, _, _ = prepare_feature_matrix(sample_df)

    predictions = model.predict(sample_X)
    sample_df['predicted_amount'] = predictions
    sample_df['abs_error'] = np.abs(sample_df['amount'] - sample_df['predicted_amount'])
    sample_df['pct_error'] = (sample_df['abs_error'] / sample_df['amount']) * 100

    print("=" * 85)
    print(f" SAMPLE PREDICTIONS ON {num_samples} CONTRACTS ")
    print("=" * 85)
    cols_to_show = ['contract_id', 'service_type', 'contractor_tier', 'priority', 'duration_months', 'amount', 'predicted_amount', 'abs_error', 'pct_error']
    
    print(sample_df[cols_to_show].to_string(index=False, formatters={
        'amount': lambda x: f"Rs. {x:,.2f}",
        'predicted_amount': lambda x: f"Rs. {x:,.2f}",
        'abs_error': lambda x: f"Rs. {x:,.2f}",
        'pct_error': lambda x: f"{x:.2f}%"
    }))
    
    print("-" * 85)
    print(f" Mean Absolute Error on Sample: Rs. {sample_df['abs_error'].mean():,.2f}")
    print(f" Mean Percentage Error on Sample: {sample_df['pct_error'].mean():.2f}%")
    print("=" * 85)

if __name__ == "__main__":
    predict_on_sample()
