[project]
name = "$product_id"
version = "0.1.0"
description = "$product_name — agent SaaS backend"
readme = "README.md"
requires-python = ">=3.11"
dependencies = [
    "anthropic>=0.40.0",
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.32.0",
    "pydantic>=2.0.0",
]

[project.optional-dependencies]
dev = ["pytest>=8.0.0", "httpx>=0.27.0"]

[project.scripts]
$package_name = "${package_name}.cli:main"

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
where = ["."]
include = ["${package_name}*"]
