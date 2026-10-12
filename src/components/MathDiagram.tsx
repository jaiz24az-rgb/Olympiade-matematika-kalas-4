import React from 'react';
import { Question } from '../types';

interface MathDiagramProps {
  question: Question;
}

export const MathDiagram: React.FC<MathDiagramProps> = ({ question }) => {
  const { svgDiagramType, svgData } = question;

  if (!svgDiagramType) return null;

  if (svgDiagramType === 'fraction_bars') {
    return (
      <div className="my-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-xs font-semibold text-slate-500 mb-2">Visualisasi Pecahan:</p>
        <div className="space-y-2">
          {/* 1/2 representation */}
          <div className="flex items-center gap-3">
            <span className="w-14 text-xs font-mono font-bold text-slate-700">1/2</span>
            <div className="flex-1 h-6 bg-slate-200 rounded overflow-hidden flex border border-slate-300">
              <div className="w-1/2 h-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">1/2</div>
              <div className="w-1/2 h-full bg-slate-100"></div>
            </div>
          </div>
          {/* 2/5 representation */}
          <div className="flex items-center gap-3">
            <span className="w-14 text-xs font-mono font-bold text-slate-700">2/5</span>
            <div className="flex-1 h-6 bg-slate-200 rounded overflow-hidden flex border border-slate-300">
              <div className="w-2/5 h-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold">2/5</div>
              <div className="w-3/5 h-full bg-slate-100"></div>
            </div>
          </div>
          {/* 3/10 representation */}
          <div className="flex items-center gap-3">
            <span className="w-14 text-xs font-mono font-bold text-slate-700">3/10</span>
            <div className="flex-1 h-6 bg-slate-200 rounded overflow-hidden flex border border-slate-300">
              <div className="w-[30%] h-full bg-amber-500 flex items-center justify-center text-[10px] text-white font-bold">3/10</div>
              <div className="w-[70%] h-full bg-slate-100"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (svgDiagramType === 'rectangle_grid') {
    return (
      <div className="my-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center">
        <p className="text-xs font-semibold text-slate-500 mb-2 self-start">Sketsa Bangun Datar:</p>
        <svg viewBox="0 0 240 140" className="w-56 h-32 max-w-full">
          {/* Outer Rectangle */}
          <rect x="20" y="20" width="200" height="90" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2.5" rx="4" />
          {/* Dimension texts */}
          <text x="120" y="15" textAnchor="middle" className="text-xs fill-slate-700 font-bold" fontSize="12">
            Panjang: {svgData?.width || 16} cm
          </text>
          <text x="230" y="68" textAnchor="middle" className="text-xs fill-slate-700 font-bold" fontSize="12" transform="rotate(90, 230, 68)">
            Lebar: {svgData?.height || '?'} cm
          </text>
          <text x="120" y="70" textAnchor="middle" className="text-xs fill-blue-600 font-semibold" fontSize="11">
            Keliling = 48 cm
          </text>
        </svg>
      </div>
    );
  }

  if (svgDiagramType === 'pattern_sequence') {
    const seq = (svgData?.sequence as (number | string)[]) || [3, 7, 15, 31, 63, '?'];
    return (
      <div className="my-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-xs font-semibold text-slate-500 mb-3">Diagram Barisan Pola Bilangan:</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {seq.map((num, idx) => (
            <React.Fragment key={idx}>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                  num === '?'
                    ? 'bg-amber-100 text-amber-800 border-2 border-dashed border-amber-400 animate-pulse'
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}
              >
                {num}
              </div>
              {idx < seq.length - 1 && (
                <div className="text-xs font-bold text-blue-500">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (svgDiagramType === 'angle_geometry') {
    return (
      <div className="my-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center">
        <p className="text-xs font-semibold text-slate-500 mb-2 self-start">Sketsa Dua Persegi Berdampingan:</p>
        <svg viewBox="0 0 260 160" className="w-64 h-40 max-w-full">
          {/* Persegi 1 (10x10) */}
          <rect x="20" y="40" width="100" height="100" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <text x="70" y="95" textAnchor="middle" fontSize="11" fill="#B45309" fontWeight="bold">s = 10 cm</text>
          
          {/* Persegi 2 (6x6) */}
          <rect x="120" y="80" width="60" height="60" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
          <text x="150" y="115" textAnchor="middle" fontSize="10" fill="#1D4ED8" fontWeight="bold">s = 6 cm</text>

          {/* Diagonal Line forming the Triangle */}
          <polygon points="20,140 180,80 180,140" fill="#DC2626" fillOpacity="0.25" stroke="#DC2626" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="20" y1="140" x2="180" y2="80" stroke="#DC2626" strokeWidth="2.5" />
          
          {/* Label alas */}
          <text x="100" y="155" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="bold">Total Alas = 10 + 6 = 16 cm</text>
        </svg>
      </div>
    );
  }

  if (svgDiagramType === 'balance_scale') {
    return (
      <div className="my-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-around text-center text-xs">
        <div className="p-2 bg-white rounded-lg border border-slate-200 w-28">
          <span className="text-lg">🐔</span>
          <p className="font-bold text-slate-800">Ayam</p>
          <p className="text-slate-500">2 Kaki / ekor</p>
        </div>
        <div className="font-extrabold text-blue-600 text-sm">+</div>
        <div className="p-2 bg-white rounded-lg border border-slate-200 w-28">
          <span className="text-lg">🐐</span>
          <p className="font-bold text-slate-800">Kambing</p>
          <p className="text-slate-500">4 Kaki / ekor</p>
        </div>
        <div className="font-extrabold text-blue-600 text-sm">=</div>
        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 w-32">
          <p className="font-bold text-blue-900">Total: 12 Kepala</p>
          <p className="font-semibold text-blue-700">32 Kaki</p>
        </div>
      </div>
    );
  }

  return null;
};
