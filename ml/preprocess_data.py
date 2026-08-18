import os
import pandas as pd
import numpy as np

def load_and_merge_data(dataset_dir="dataset"):
    """
    Loads all relational CSV datasets and merges them into a single comprehensive DataFrame.
    """
    if not os.path.exists(dataset_dir):
        alt_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dataset")
        if os.path.exists(alt_path):
            dataset_dir = alt_path

    contracts_path = os.path.join(dataset_dir, "contracts.csv")
    contractors_path = os.path.join(dataset_dir, "contractors.csv")
    employees_path = os.path.join(dataset_dir, "employees.csv")
    service_requests_path = os.path.join(dataset_dir, "service_requests.csv")
    users_path = os.path.join(dataset_dir, "users.csv")

    contracts = pd.read_csv(contracts_path)
    contractors = pd.read_csv(contractors_path)
    employees = pd.read_csv(employees_path)
    service_requests = pd.read_csv(service_requests_path)
    users = pd.read_csv(users_path)

    # Relational merges
    merged = contracts.merge(
        service_requests[['request_id', 'sub_service', 'district', 'estimated_budget']], 
        on='request_id', 
        how='left', 
        suffixes=('', '_req')
    )
    merged = merged.merge(
        contractors[['contractor_id', 'specialization', 'rating', 'years_in_business', 'active_contracts', 'completion_rate_percent']], 
        on='contractor_id', 
        how='left', 
        suffixes=('', '_contractor')
    )
    merged = merged.merge(
        employees[['employee_id', 'department', 'role', 'experience_years', 'workload']], 
        on='employee_id', 
        how='left', 
        suffixes=('', '_emp')
    )
    merged = merged.merge(
        users[['user_id', 'gender', 'age', 'district']], 
        on='user_id', 
        how='left', 
        suffixes=('', '_user')
    )

    # Feature Engineering: Date processing
    merged['start_date_dt'] = pd.to_datetime(merged['start_date'], format='%d-%m-%Y', errors='coerce')
    merged['end_date_dt'] = pd.to_datetime(merged['end_date'], format='%d-%m-%Y', errors='coerce')
    merged['contract_days'] = (merged['end_date_dt'] - merged['start_date_dt']).dt.days
    merged['start_year'] = merged['start_date_dt'].dt.year
    merged['start_month'] = merged['start_date_dt'].dt.month
    merged['start_dayofweek'] = merged['start_date_dt'].dt.dayofweek

    return merged

def prepare_feature_matrix(df):
    """
    Extracts feature matrix X and target y, performing categorical type string conversion.
    """
    categorical_features = [
        'service_type', 'sub_service', 'contractor_tier', 'priority', 
        'status', 'renewal_required', 'district', 'district_user', 
        'specialization', 'department', 'role', 'gender'
    ]

    numerical_features = [
        'duration_months', 'contract_days', 'start_year', 'start_month', 'start_dayofweek',
        'rating', 'years_in_business', 'active_contracts', 'completion_rate_percent',
        'experience_years', 'workload', 'age'
    ]

    feature_cols = categorical_features + numerical_features
    X = df[feature_cols].copy()

    for col in categorical_features:
        X[col] = X[col].fillna('Missing').astype(str)

    for col in numerical_features:
        X[col] = pd.to_numeric(X[col], errors='coerce').fillna(0)

    y = df['amount'] if 'amount' in df.columns else None

    return X, y, categorical_features, numerical_features

def build_prediction_input(input_dict):
    """
    Constructs a 1-row DataFrame containing all feature columns required by the trained ML pipeline.
    """
    now = pd.Timestamp.now()
    
    # Parse duration
    duration_months = float(input_dict.get('duration_months', 1))
    contract_days = int(input_dict.get('contract_days', max(1, int(duration_months * 30))))

    data = {
        # Categoricals
        'service_type': str(input_dict.get('service_type', 'Plumbing')),
        'sub_service': str(input_dict.get('sub_service', 'General Service')),
        'contractor_tier': str(input_dict.get('contractor_tier', 'Silver')),
        'priority': str(input_dict.get('priority', 'Medium')),
        'status': str(input_dict.get('status', 'Active')),
        'renewal_required': str(input_dict.get('renewal_required', 'No')),
        'district': str(input_dict.get('district', 'Ahmedabad')),
        'district_user': str(input_dict.get('district_user', input_dict.get('district', 'Ahmedabad'))),
        'specialization': str(input_dict.get('specialization', input_dict.get('service_type', 'Plumbing'))),
        'department': str(input_dict.get('department', 'Maintenance')),
        'role': str(input_dict.get('role', 'Technician')),
        'gender': str(input_dict.get('gender', 'Male')),

        # Numericals
        'duration_months': duration_months,
        'contract_days': contract_days,
        'start_year': int(input_dict.get('start_year', now.year)),
        'start_month': int(input_dict.get('start_month', now.month)),
        'start_dayofweek': int(input_dict.get('start_dayofweek', now.dayofweek)),
        'rating': float(input_dict.get('rating', 4.5)),
        'years_in_business': float(input_dict.get('years_in_business', 5.0)),
        'active_contracts': float(input_dict.get('active_contracts', 2.0)),
        'completion_rate_percent': float(input_dict.get('completion_rate_percent', 95.0)),
        'experience_years': float(input_dict.get('experience_years', 6.0)),
        'workload': float(input_dict.get('workload', 3.0)),
        'age': float(input_dict.get('age', 35.0)),
    }

    df = pd.DataFrame([data])
    X, _, _, _ = prepare_feature_matrix(df)
    return X

if __name__ == "__main__":
    df = load_and_merge_data()
    X, y, cat_cols, num_cols = prepare_feature_matrix(df)
    print(f"Data merged successfully. Shape: {df.shape}")
    print(f"Features: {X.shape[1]} ({len(cat_cols)} categorical, {len(num_cols)} numerical)")
    if y is not None:
        print(f"Target 'amount' mean: {y.mean():.2f}, std: {y.std():.2f}")

