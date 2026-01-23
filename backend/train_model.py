import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# Load Dataset
print("📊 Loading dataset...")
df = pd.read_csv("Crop_recommendation.csv")
print(f"✓ Dataset loaded with {len(df)} samples")

# Encode labels
print("\n🔤 Encoding labels...")
label_encoder = LabelEncoder()
df["label_encoded"] = label_encoder.fit_transform(df["label"])
print(f"✓ {len(label_encoder.classes_)} crops encoded")

# Prepare data
X = df.drop(columns=["label", "label_encoded"])
y = df["label_encoded"]
print(f"✓ Features: {X.shape[1]} | Target samples: {len(y)}")

# Split data
print("\n📈 Splitting data (80% train, 20% test)...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=41, stratify=y)
print(f"✓ Training samples: {len(X_train)} | Test samples: {len(X_test)}")

# Train Model
print("\n🤖 Training Random Forest model...")
rf_model = RandomForestClassifier(n_estimators=100, random_state=41, n_jobs=-1)
rf_model.fit(X_train, y_train)
print("✓ Model training completed")

# Evaluate Model
print("\n📊 Evaluating model on test set...")
y_pred = rf_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\n{'='*60}")
print(f"Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
print(f"{'='*60}")

# Classification Report
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=label_encoder.classes_, digits=4))

# Save Model and Label Encoder
print("\n💾 Saving model and label encoder...")
pickle.dump(rf_model, open("crop_model.pkl", "wb"))
pickle.dump(label_encoder, open("label_encoder.pkl", "wb"))
print("✓ crop_model.pkl saved")
print("✓ label_encoder.pkl saved")

print("\n" + "="*60)
print("✅ MODEL TRAINING COMPLETED SUCCESSFULLY!")
print("="*60)

