import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

data = pd.read_csv("C:/Users/Lenovo/Desktop/university/labs/Lab5.1_Mobiles/gestures_dataset.csv")
data = data.sample(frac=1, random_state=42).reset_index(drop=True)

X = data[['ax', 'ay', 'az', 'gx', 'gy', 'gz']]
y = data['gesture']

encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    max_features='sqrt',
    bootstrap=True,
    random_state=42
)

model.fit(X_train, y_train)

cv_scores = cross_val_score(model, X, y_encoded, cv=5)
print("CV Accuracy:", cv_scores.mean())

y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.3f}")

print("Classification Report:\n", classification_report(y_test, y_pred, target_names=encoder.classes_))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

joblib.dump(model, "gesture_model.pkl")
joblib.dump(encoder, "label_encoder.pkl")

print("Saved!")
