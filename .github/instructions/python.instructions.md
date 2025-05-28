---
applyTo: "**/*.py,**/*.ipynb"
---
# Project coding standards for Python

This document outlines coding standards for developing FastAPI applications in Python. Adhering to these standards ensures consistency, maintainability, and readability of the codebase.

## Logical Organization
   Structure your project into logical modules or packages (e.g., `models`, `routers`, `services`, `utils`).

* **Directory Structure:**
    * Use a clear directory structure:
        ```
        backend/
        ├── app/
        │   ├── __init__.py
        │   ├── main.py
        │   ├── models/
        │   ├── routers/
        │   ├── services/
        │   └── utils/
        ├── tests/
        └── requirements.txt
        ```
## Conda Environment
   create requirments.txt for dependencies.
   use conda env "react_native_env" for virtual environment.

## Separation of Concerns
Separate API logic, data access, and business logic into different modules.

## Clear Entry Point
Have a clear `main.py` or `app.py` as the application's entry point.

## Code Style
   Generate code adhering to PEP 8 (naming, line length, imports).
   Use specific exceptions and `try-except-finally` blocks.
   Use `httpx` for making HTTP requests in FastAPI.
