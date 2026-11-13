import datetime
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import BigInteger, String, DateTime

from orm.base import Base

class Therapy(Base):
    
    __tablename__ = 'therapy_addition_dynamic_select_option' 

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    creation_time: Mapped[datetime.datetime] = mapped_column(DateTime)
    last_modified_time: Mapped[datetime.datetime] = mapped_column(DateTime)
    version: Mapped[int] = mapped_column(BigInteger)
    
    id_in_source: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    status: Mapped[str] = mapped_column(String(50))
    therapy_description_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    option_value: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    created_by_id: Mapped[int] = mapped_column(BigInteger)
    modified_by_id: Mapped[int] = mapped_column(BigInteger)