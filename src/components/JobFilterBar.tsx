import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Filter, 
  ShieldCheck, 
  RotateCcw,
  Tag,
  X,
  ChevronDown
} from 'lucide-react';
import type { Province, Industry } from '../types';
import { provinceApi } from '../api';
import { SalaryRangeFilter } from './job/SalaryRangeFilter';
import { formatVndAmountCompact } from '../utils/salary';

export interface FilterState {
  keyword: string;
  provinceId?: number | null;
  selectedIndustryIds: number[];
  salaryMin: number | null;
  salaryMax: number | null;
  includeNegotiable: boolean;
  jobType: string;
  sortBy: string;
  verifiedOnly: boolean;
}

interface JobFilterBarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalCount?: number;
}

export const JobFilterBar: React.FC<JobFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  totalCount,
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoadingMetadata(true);
        const [pData, iData] = await Promise.all([
          provinceApi.getProvinces(),
          provinceApi.getIndustries(),
        ]);
        setProvinces(pData);
        setIndustries(iData);
      } catch (err) {
        console.error('Error fetching filter metadata:', err);
      } finally {
        setLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, []);

  const cities = provinces.filter((p) => p.type === 'thanh_pho');
  const provincesList = provinces.filter((p) => p.type === 'tinh');

  const selectedProvince = provinces.find((p) => p.id === filters.provinceId);
  const selectedIndustries = industries.filter((i) =>
    filters.selectedIndustryIds.includes(i.id)
  );

  const toggleIndustry = (industryId: number) => {
    const current = filters.selectedIndustryIds;
    const next = current.includes(industryId)
      ? current.filter((id) => id !== industryId)
      : [...current, industryId];
    onChange({ ...filters, selectedIndustryIds: next });
  };

  const removeProvince = () => {
    onChange({ ...filters, provinceId: null });
  };

  const removeIndustry = (id: number) => {
    onChange({
      ...filters,
      selectedIndustryIds: filters.selectedIndustryIds.filter((i) => i !== id),
    });
  };

  const removeSalary = () => {
    onChange({ ...filters, salaryMin: null, salaryMax: null, includeNegotiable: true });
  };

  const removeJobType = () => {
    onChange({ ...filters, jobType: 'all' });
  };

  const hasSalaryFilter = filters.salaryMin !== null || filters.salaryMax !== null || !filters.includeNegotiable;

  const hasActiveFilters =
    filters.keyword ||
    filters.provinceId ||
    filters.selectedIndustryIds.length > 0 ||
    hasSalaryFilter ||
    filters.jobType !== 'all' ||
    filters.verifiedOnly;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
      {/* Row 1: Primary Inputs (Keyword, 34 Provinces, Sort, Reset) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Keyword Search */}
        <div className="lg:col-span-5 flex items-center gap-2 px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
            placeholder="Chức danh, vị trí, công ty..."
            className="w-full bg-transparent text-xs sm:text-sm focus:outline-hidden text-slate-800 placeholder:text-slate-400 font-medium"
          />
          {filters.keyword && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, keyword: '' })}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 34 Tỉnh / Thành phố Combobox */}
        <div className="lg:col-span-4 flex items-center gap-2 px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-500 transition-all">
          <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
          <select
            value={filters.provinceId || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                provinceId: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full bg-transparent text-xs sm:text-sm focus:outline-hidden text-slate-800 font-medium cursor-pointer"
          >
            <option value="">📍 Tất cả 34 tỉnh/thành</option>
            {cities.length > 0 && (
              <optgroup label="🏢 6 Thành phố trực thuộc Trung ương">
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </optgroup>
            )}
            {provincesList.length > 0 && (
              <optgroup label="🌲 28 Tỉnh">
                {provincesList.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Sort By */}
        <div className="lg:col-span-2 flex items-center gap-2 px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-500 transition-all">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
            className="w-full bg-transparent text-xs sm:text-sm focus:outline-hidden text-slate-800 font-medium cursor-pointer"
          >
            <option value="posted_date_desc">Mới nhất</option>
            <option value="trust_score_desc">Uy tín cao nhất</option>
            <option value="posted_date_asc">Cũ nhất</option>
          </select>
        </div>

        {/* Reset Button */}
        <div className="lg:col-span-1">
          <button
            onClick={onReset}
            title="Đặt lại toàn bộ bộ lọc"
            className="w-full h-full min-h-[42px] px-3 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span className="lg:hidden">Đặt lại</span>
          </button>
        </div>
      </div>

      {/* Row 2: Dual Range Slider for Salary */}
      <SalaryRangeFilter
        value={{
          salaryMin: filters.salaryMin,
          salaryMax: filters.salaryMax,
          includeNegotiable: filters.includeNegotiable,
        }}
        onChange={(val) =>
          onChange({
            ...filters,
            salaryMin: val.salaryMin,
            salaryMax: val.salaryMax,
            includeNegotiable: val.includeNegotiable,
          })
        }
      />

      {/* Row 3: Industries / Tags Multi-Select Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ngành nghề & Lĩnh vực:</span>
            {filters.selectedIndustryIds.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                {filters.selectedIndustryIds.length} đã chọn
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
            className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 sm:hidden text-xs cursor-pointer"
          >
            <span>{showIndustryDropdown ? 'Thu gọn' : 'Xem tất cả ngành'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showIndustryDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Industry Pill Chips */}
        <div className={`flex flex-wrap gap-2 pt-0.5 ${showIndustryDropdown ? 'block' : 'max-sm:max-h-16 max-sm:overflow-hidden'}`}>
          {industries.map((ind) => {
            const isSelected = filters.selectedIndustryIds.includes(ind.id);
            return (
              <button
                key={ind.id}
                type="button"
                onClick={() => toggleIndustry(ind.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span>{ind.name}</span>
                {isSelected && <X className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 4: Job Type Tabs & Verified Filter */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-500 mr-1">Hình thức:</span>
          {[
            { key: 'all', label: 'Tất cả công việc' },
            { key: 'full_time', label: 'Chính thức (Full-time)' },
            { key: 'small_job', label: 'Small Job (Theo ca / Ngắn hạn)' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange({ ...filters, jobType: tab.key })}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                filters.jobType === tab.key
                  ? tab.key === 'small_job'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-700 hover:text-emerald-700 transition-colors">
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => onChange({ ...filters, verifiedOnly: e.target.checked })}
            className="rounded-md text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
          />
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Chỉ Doanh nghiệp đã xác minh
        </label>
      </div>

      {/* Row 5: Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-2.5 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold text-[11px]">Đang lọc:</span>

          {filters.keyword && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-medium text-xs border border-blue-200/60">
              Từ khóa: "{filters.keyword}"
              <X
                className="w-3 h-3 cursor-pointer hover:text-blue-900"
                onClick={() => onChange({ ...filters, keyword: '' })}
              />
            </span>
          )}

          {selectedProvince && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-medium text-xs border border-blue-200/60">
              📍 {selectedProvince.name} ({selectedProvince.type === 'thanh_pho' ? 'TP' : 'Tỉnh'})
              <X
                className="w-3 h-3 cursor-pointer hover:text-blue-900"
                onClick={removeProvince}
              />
            </span>
          )}

          {selectedIndustries.map((ind) => (
            <span
              key={ind.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-medium text-xs border border-indigo-200/60"
            >
              #{ind.name}
              <X
                className="w-3 h-3 cursor-pointer hover:text-indigo-900"
                onClick={() => removeIndustry(ind.id)}
              />
            </span>
          ))}

          {hasSalaryFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-medium text-xs border border-emerald-200/60">
              💵 Lương: {
                filters.salaryMin !== null && filters.salaryMax !== null
                  ? `${formatVndAmountCompact(filters.salaryMin)} - ${formatVndAmountCompact(filters.salaryMax)}`
                  : filters.salaryMin !== null
                  ? `Từ ${formatVndAmountCompact(filters.salaryMin)}`
                  : filters.salaryMax !== null
                  ? `Tới ${formatVndAmountCompact(filters.salaryMax)}`
                  : ''
              }
              {!filters.includeNegotiable && ' (Không gồm thỏa thuận)'}
              <X
                className="w-3 h-3 cursor-pointer hover:text-emerald-900"
                onClick={removeSalary}
              />
            </span>
          )}

          {filters.jobType !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-medium text-xs border border-amber-200/60">
              {filters.jobType === 'full_time' ? 'Toàn thời gian' : 'Small Job'}
              <X
                className="w-3 h-3 cursor-pointer hover:text-amber-900"
                onClick={removeJobType}
              />
            </span>
          )}

          <button
            type="button"
            onClick={onReset}
            className="text-[11px] text-red-600 hover:text-red-700 font-bold ml-auto hover:underline cursor-pointer"
          >
            Xóa tất cả ({totalCount !== undefined ? `${totalCount} kết quả` : ''})
          </button>
        </div>
      )}
    </div>
  );
};
