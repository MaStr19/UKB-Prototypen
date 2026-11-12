'use client';

import React from 'react';
import { EvaRecord, SubstanceRow } from '../../types/eva';
import { FlaskConical, Trash2, Info } from 'lucide-react';

interface Props {
  record: EvaRecord;
  onChange: <K extends keyof EvaRecord>(key: K, value: EvaRecord[K]) => void;
}

export const SubstancesTableSection: React.FC<Props> = ({ record, onChange }) => {
  const updateRow = (index: number, updates: Partial<SubstanceRow>) => {
    const updated = [...record.substanzen];
    updated[index] = { ...updated[index], ...updates };
    onChange('substanzen', updated);
  };

  const clearRow = (index: number) => {
    updateRow(index, {
      expoFlag: '',
      noxeName: '',
      noxeFlag: '',
      mengeVal: '',
      mengeFlag: '',
    });
  };

  return (
    <div>
    </div>
  );
};
