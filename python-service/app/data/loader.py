import pandas as pd
from sqlalchemy import create_engine
from app.core import config

COLUMNS = ["id", "brand_name", "salt_composition", "strength", "dosage_form",
           "manufacturer", "pack_size", "mrp", "rx_required"]


def load_medicines():
    if config.MEDICINES_SOURCE == "db":
        df = pd.read_sql(f"SELECT {', '.join(COLUMNS)} FROM medicines", create_engine(config.DB_URL))
    else:
        df = pd.read_csv(config.CSV_PATH)
        if "id" not in df.columns:
            df.insert(0, "id", range(1, len(df) + 1))
    return df[COLUMNS].fillna("")