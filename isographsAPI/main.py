from fastapi import FastAPI
from pydantic import BaseModel
from estimation import generate_isograph

app = FastAPI()


class EstimationRequest(BaseModel):
    cost_samples: list
    order: int
    dim_sample_count: int


@app.get("/")
async def root():
    return {"message": "Matador Isograph API"}


@app.post("/estimate")
async def estimate_polynomial(request: EstimationRequest):
    return {"estimates": generate_isograph(request.cost_samples, request.order, request.dim_sample_count).tolist()}
