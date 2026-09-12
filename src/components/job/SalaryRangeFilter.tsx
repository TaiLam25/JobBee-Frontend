import React, { useState, useEffect, useRef } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { DollarSign, CheckSquare, Square, Sparkles } from 'lucide-react';
import { jobApi } from '../../api';
import { formatVndAmount, formatVndAmountCompact } from '../../utils/salary';

export interface SalaryFilterValue {
  salaryMin: number | null;
  salaryMax: number | null;
  includeNegotiable: boolean;
}

interface SalaryRangeFilterProps {
  value: SalaryFilterValue;
  onChange: (val: SalaryFilterValue) => void;
}

export const SalaryRangeFilter: React.FC<SalaryRangeFilterProps> = ({
  value,
  onChange,
}) => {
  const [bounds, setBounds] = useState<{ min: number; max: number }>({ min: 0, max: 80000000 });
  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 80000000]);
  const [includeNegotiable, setIncludeNegotiable] = useState<boolean>(value.includeNegotiable ?? true);
  const [isCustom, setIsCustom] = useState<boolean>(Boolean(value.salaryMin !== null || value.salaryMax !== null));
  const debounceTimerRef = useRef<any>(null);

  useEffect(() => {
    jobApi.getSalaryRange().then((data) => {
      // Round min/max to nearest million for clean slider limits
      const dbMin = Math.floor((data.min || 0) / 1000000) * 1000000;
      const dbMax = Math.ceil((data.max || 80000000) / 1000000) * 1000000;
      const cleanMin = Math.max(0, dbMin);
      const cleanMax = Math.max(cleanMin + 10000000, dbMax);

      setBounds({ min: cleanMin, max: cleanMax });

      const currentMin = value.salaryMin !== null ? value.salaryMin : cleanMin;
      const currentMax = value.salaryMax !== null ? value.salaryMax : cleanMax;
      setSliderRange([currentMin, currentMax]);
    }).catch((err) => {
      console.error('Error fetching salary range bounds:', err);
    });
  }, []);

  // Sync external reset
  useEffect(() => {
    if (value.salaryMin === null && value.salaryMax === null) {
      setSliderRange([bounds.min, bounds.max]);
      setIsCustom(false);
    } else {
      setSliderRange([value.salaryMin ?? bounds.min, value.salaryMax ?? bounds.max]);
      setIsCustom(true);
    }
    setIncludeNegotiable(value.includeNegotiable ?? true);
  }, [value.salaryMin, value.salaryMax, value.includeNegotiable, bounds.min, bounds.max]);

  const handleSliderChange = (newValues: number | number[]) => {
    if (!Array.isArray(newValues) || newValues.length < 2) return;
    const [min, max] = newValues as [number, number];
    setSliderRange([min, max]);
    setIsCustom(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange({
        salaryMin: min,
        salaryMax: max,
        includeNegotiable,
      });
    }, 350);
  };

  const handleToggleNegotiable = () => {
    const nextNeg = !includeNegotiable;
    setIncludeNegotiable(nextNeg);
    onChange({
      salaryMin: isCustom ? sliderRange[0] : null,
      salaryMax: isCustom ? sliderRange[1] : null,
      includeNegotiable: nextNeg,
    });
  };

  const applyPreset = (presetMin: number | null, presetMax: number | null) => {
    if (presetMin === null && presetMax === null) {
      setIsCustom(false);
      setSliderRange([bounds.min, bounds.max]);
      onChange({
        salaryMin: null,
        salaryMax: null,
        includeNegotiable,
      });
    } else {
      const sMin = presetMin ?? bounds.min;
      const sMax = presetMax ?? bounds.max;
      setIsCustom(true);
      setSliderRange([sMin, sMax]);
      onChange({
        salaryMin: sMin,
        salaryMax: sMax,
        includeNegotiable,
      });
    }
  };

  const PRESETS = [
    { label: 'Tất cả', min: null, max: null },
    { label: '< 10 triệu', min: 0, max: 10000000 },
    { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
    { label: '20 - 35 triệu', min: 20000000, max: 35000000 },
    { label: '> 35 triệu', min: 35000000, max: bounds.max },
  ];

  return (
    <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-xs">Khoảng lương:</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
            {isCustom ? `${formatVndAmountCompact(sliderRange[0])} - ${formatVndAmountCompact(sliderRange[1])}` : 'Mọi mức lương'}
          </span>
        </div>

        {/* Checkbox include negotiable */}
        <button
          type="button"
          onClick={handleToggleNegotiable}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 hover:text-indigo-700 cursor-pointer select-none transition-colors"
        >
          {includeNegotiable ? (
            <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
          ) : (
            <Square className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>Bao gồm tin Thỏa thuận</span>
        </button>
      </div>

      {/* Slider */}
      <div className="px-2 pt-2.5 pb-1">
        <Slider
          range
          min={bounds.min}
          max={bounds.max}
          step={1000000}
          value={sliderRange}
          onChange={handleSliderChange}
          styles={{
            track: { backgroundColor: '#4f46e5', height: 4 },
            rail: { backgroundColor: '#cbd5e1', height: 4 },
            handle: {
              borderColor: '#4f46e5',
              height: 14,
              width: 14,
              marginTop: -5,
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              opacity: 1,
            },
          }}
        />

        {/* Min / Max Labels under slider */}
        <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-500 mt-1.5">
          <span>{formatVndAmount(sliderRange[0])}</span>
          <span>{formatVndAmount(sliderRange[1])}</span>
        </div>
      </div>

      {/* Quick Preset Buttons (Compact) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
        <span className="text-slate-400 text-[10.5px] font-medium shrink-0">Mức gợi ý:</span>
        {PRESETS.map((p, idx) => {
          const isSelected =
            (p.min === null && p.max === null && !isCustom) ||
            (isCustom && p.min === sliderRange[0] && p.max === sliderRange[1]);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p.min, p.max)}
              className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium shrink-0 transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
