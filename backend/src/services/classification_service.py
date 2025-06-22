from transformers import pipeline

class ClassificationService:
    def __init__(self):
        """
        Initializes the Classification Service and loads the zero-shot-classification model.
        This is a heavy operation and should only be done once.
        """
        try:
            print("Loading Zero-Shot-Classification model...")
            self.classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli"
            )
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading classification model: {e}")
            self.classifier = None

    def classify_text(self, text: str, candidate_labels: list[str]) -> dict:
        """
        Classifies a given text against a list of candidate labels.

        Args:
            text: The text to classify.
            candidate_labels: A list of strings representing the possible categories.

        Returns:
            A dictionary containing the classification results.
        """
        if not self.classifier:
            return {
                "error": "Classifier not available",
                "text": text,
                "labels": [],
                "scores": []
            }
        
        if not text or not candidate_labels:
            return {
                "text": text,
                "labels": [],
                "scores": []
            }

        result = self.classifier(text, candidate_labels)
        return result

# Create a single instance of the service to be used by the application
classification_service = ClassificationService() 