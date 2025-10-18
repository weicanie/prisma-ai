#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
HTTP service for deepwiki-to-md.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import os

from src.application.usecase.rsc_wiki_usecase import ConvertWikiSiteToMarkdownViaRSCUsecase
from src.infrastructure.gateway.file_adapter import FileAdapter
from src.infrastructure.gateway.rsc_adapter import RSCAdapter
from src.infrastructure.repository.file_repository import FileRepository
from src.infrastructure.repository.rsc_repository import RSCRepository

app = FastAPI()

class WikiRequest(BaseModel):
    wikiUrl: str
    outputDir: str

@app.post("/wiki")
async def convert_wiki(dto: WikiRequest):
    """
    Convert a wiki site to Markdown.
    """
    try:
        # RSC mode: Direct Markdown extraction
        print("Using RSC (React Server Components) interception mode...")
        
        # Initialize adapters for RSC mode
        rsc_adapter = RSCAdapter()
        file_adapter = FileAdapter()
        
        # Initialize repositories for RSC mode
        rsc_repository = RSCRepository(rsc_adapter)
        file_repository = FileRepository(file_adapter)
        
        # Initialize RSC usecase
        usecase = ConvertWikiSiteToMarkdownViaRSCUsecase(
            rsc_repository,
            file_repository,
        )
        
        # Execute the RSC usecase
        await usecase.execute(dto.wikiUrl, dto.outputDir)
        
        return {"message": "Wiki content converted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def start_service(host: str = "0.0.0.0", port: int = 9009):
    """Start the HTTP service."""
    uvicorn.run(app, host=host, port=port)