from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from services.classification_service import classification_service

router = APIRouter()

class ClassificationRequest(BaseModel):
    text: str
    candidate_labels: List[str]

@router.post("/tag-text", summary="Classify text against candidate labels")
async def tag_text(request: ClassificationRequest):
    """
    Accepts a text summary and a list of potential tags (candidate labels),
    and returns a ranked list of which labels best fit the text.

    - **text**: The text summary to classify.
    - **candidate_labels**: A list of strings to classify the text against. 
      (e.g., ["medical", "housing", "family relations", "employment"])
    """
    try:
        if not request.text or not request.candidate_labels:
            raise HTTPException(
                status_code=400, 
                detail="Both 'text' and 'candidate_labels' are required."
            )

        result = classification_service.classify_text(
            request.text, 
            request.candidate_labels
        )
        
        if result.get("error"):
             raise HTTPException(status_code=503, detail=result.get("error"))

        return {
            "text": request.text,
            "results": {
                "labels": result.get("labels", []),
                "scores": result.get("scores", [])
            }
        }
    except HTTPException:
        # Re-raise HTTPException to preserve status code and details
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}") 