import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import BigInteger, Integer, String, Boolean, DateTime, Date, Numeric

from orm.base import Base


class Consultation(Base):

    
    __tablename__ = 'consultation' 

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    creation_time: Mapped[datetime.datetime] = mapped_column(DateTime)
    last_modified_time: Mapped[datetime.datetime] = mapped_column(DateTime)
    version: Mapped[int] = mapped_column(BigInteger)
    id_in_source: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    consultation_case_id: Mapped[int] = mapped_column(BigInteger)
    received_on: Mapped[datetime.datetime] = mapped_column(DateTime)
    follow_up_result_entered: Mapped[bool] = mapped_column(Boolean)
    consultant_id: Mapped[int] = mapped_column(BigInteger)
    subsequent_consultation_index: Mapped[int] = mapped_column(Integer)
    current_consultation: Mapped[bool] = mapped_column(Boolean)
    
    # Customer Details
    customer_caller_type: Mapped[str] = mapped_column(String(50))
    customer_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    customer_institution_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    customer_institution_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    customer_institution_details: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    customer_street_address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    customer_zip_code: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    customer_city: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    customer_country: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    customer_department_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    customer_position_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    customer_email_address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    customer_phone_number_anonymous: Mapped[bool] = mapped_column(Boolean)
    customer_phone_number: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    customer_fax_number: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    customer_follow_up_call_needed: Mapped[bool] = mapped_column(Boolean)
    customer_follow_up_letter_needed: Mapped[bool] = mapped_column(Boolean)
    customer_follow_up_letter_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    customer_federal_state_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    
    # Patient Details
    patient_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    patient_age_age_value: Mapped[Optional[Decimal]] = mapped_column(Numeric(38, 2), nullable=True)
    patient_age_age_unit: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    patient_age_category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    patient_age_pregnancy_week: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    patient_age_premature: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    patient_animal: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    patient_date_of_birth: Mapped[Optional[datetime.date]] = mapped_column(Date, nullable=True)
    patient_date_of_birth_unknown: Mapped[bool] = mapped_column(Boolean)
    patient_diverse_sex_info: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    patient_female_sex_info_breastfeeding: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    patient_female_sex_info_pregnant: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    patient_female_sex_info_pregnancy_week: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    patient_height_in_centimeters: Mapped[Optional[Decimal]] = mapped_column(Numeric(38, 2), nullable=True)
    patient_sex: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    patient_weight_in_kilograms: Mapped[Optional[Decimal]] = mapped_column(Numeric(38, 2), nullable=True)
    patient_further_info: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # Medical/Consultation Data
    anamnesis_enabled: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    anamnesis_further_info: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    course_of_disease_accommodation: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    course_of_disease_days_spend_in_hospital: Mapped[Optional[Decimal]] = mapped_column(Numeric(38, 2), nullable=True)
    course_of_disease_outcome_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    course_of_disease_max_reached_score: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    evidence_body_temperature_celcius: Mapped[Optional[Decimal]] = mapped_column(Numeric(38, 2), nullable=True)
    evidence_breathing_rate_per_minute: Mapped[Optional[Decimal]] = mapped_column(Numeric(38, 2), nullable=True)
    evidence_enabled: Mapped[bool] = mapped_column(Boolean)
    evidence_heart_rate_per_minute: Mapped[Optional[Decimal]] = mapped_column(Numeric(38, 2), nullable=True)
    evidence_remarks: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    evidence_state_of_consciousness: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    evidence_systolic_blood_pressure_mm_hg: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    evidence_diastolic_blood_pressure_mm_hg: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    exposure_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    exposure_further_info: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    exposure_etiology_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    exposure_place_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    
    severity_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    severity_worst_case_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source_further_info: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    substances_remarks: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    symptom_enabled: Mapped[bool] = mapped_column(Boolean)
    symptom_correlation_arguable_explanation: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    symptom_remarks: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    therapy_enabled: Mapped[bool] = mapped_column(Boolean)
    therapy_accommodation: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    therapy_further_info: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    consultation_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Audit & Additional Data
    created_by_id: Mapped[int] = mapped_column(BigInteger)
    modified_by_id: Mapped[int] = mapped_column(BigInteger)
    reviewer_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    review_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    adam_patient_age_age_value: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 0), nullable=True)
    adam_patient_age_age_unit: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    adam_patient_age_category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)