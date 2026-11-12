'use client';

import React from 'react';
import { EvaRecord } from '../../types/eva';

interface Props {
  record: EvaRecord;
  onChange: <K extends keyof EvaRecord>(key: K, value: EvaRecord[K]) => void;
}

export const SubstancesTableSection: React.FC<Props> = ({ record, onChange }) => {

  return (
    <div>
    </div>
  );
};
