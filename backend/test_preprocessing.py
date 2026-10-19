
from preprocessing import load_dataset, inspect_dataset

df = load_dataset()
report = inspect_dataset(df)

print("Dataset loaded successfully!")
print("Shape:", df.shape)
print("\nFirst five records:")
print(df.head())
print("\nPreprocessing report:")
print(report)
print("\nTarget classes:")
print(df["sleep_debt_category"].value_counts())
