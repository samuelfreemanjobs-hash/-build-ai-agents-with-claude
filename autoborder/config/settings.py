"""Application settings loaded from environment variables."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    autoborder_env: str = "development"
    autoborder_use_mock_sap: bool = True

    neo4j_uri: str = ""
    neo4j_user: str = "neo4j"
    neo4j_password: str = ""

    sap_ashost: str = ""
    sap_sysnr: str = "00"
    sap_client: str = "100"
    sap_user: str = ""
    sap_password: str = ""

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    insurance_mgu_api_url: str = ""
    insurance_mgu_api_key: str = ""

    config_dir: Path = Path(__file__).resolve().parent
    mock_data_dir: Path = Path(__file__).resolve().parent.parent / "data" / "mock"

    @property
    def neo4j_enabled(self) -> bool:
        return bool(self.neo4j_uri and self.neo4j_password)

    @property
    def sap_enabled(self) -> bool:
        return bool(self.sap_ashost and self.sap_user and not self.autoborder_use_mock_sap)


@lru_cache
def get_settings() -> Settings:
    return Settings()
