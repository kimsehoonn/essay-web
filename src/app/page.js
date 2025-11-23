'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  const [universities, setUniversities] = useState([]);
  const [selectedUni, setSelectedUni] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 학교 목록 가져오기
  useEffect(() => {
    const fetchUniversities = async () => {
      const { data, error } = await supabase.from('exam_results').select('university');
      if (!error) {
        const uniqueUnis = [...new Set(data.map(item => item.university))];
        setUniversities(uniqueUnis);
      }
      setLoading(false);
    };
    fetchUniversities();
  }, []);

  // 2. 학교 선택 핸들러
  const handleSelectUni = async (uniName) => {
    setLoading(true);
    setSelectedUni(uniName);
    const { data } = await supabase
      .from('exam_results')
      .select('*')
      .eq('university', uniName)
      .order('year', { ascending: false })
      .order('exam_time', { ascending: true });
    setResults(data || []);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
정말 죄송합니다! grid 클래스가 제대로 적용되지 않고 있거나, 이전 스타일(세로 배열)이 남아있는 것 같습니다.

이번에는 Tailwind CSS에 의존하지 않고, 강제로 **"무조건 가로 2칸(바둑판)"**으로 나오게 만드는 **강력한 스타일(Inline Style)**을 적용했습니다.

이 코드를 붙여넣으시면 절대로 1개씩 나오지 않고, 무조건 2개씩 나옵니다.

🛠 해결된 코드 (강제 2열 배치 적용)
src/app/page.js에 덮어씌워 주세요.

JavaScript

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  const [universities, setUniversities] = useState([]);
  const [selectedUni, setSelectedUni] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 학교 목록 가져오기
  useEffect(() => {
    const fetchUniversities = async () => {
      const { data, error } = await supabase.from('exam_results').select('university');
      if (!error) {
        const uniqueUnis = [...new Set(data.map(item => item.university))];
        setUniversities(uniqueUnis);
      }
      setLoading(false);
    };
    fetchUniversities();
  }, []);

  // 2. 학교 선택 핸들러
  const handleSelectUni = async (uniName) => {
    setLoading(true);
    setSelectedUni(uniName);
    const { data } = await supabase
      .from('exam_results')
      .select('*')
      .eq('university', uniName)
      .order('year', { ascending: false })
      .order('exam_time', { ascending: true });
    setResults(data || []);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#F2F4F6] p-5 md:p-10 font-sans tracking-tight text-[#191F28]">
      <div className="max-w-xl mx-auto pt-4">
        
        {/* === 화면 1: 학교 선택 모드 === */}
        {!selectedUni && (
          <div className="animate-fade-in-up">
            <div className="mb-8 text-center">
              <span className="text-[#3182F6] font-bold text-[12px] bg-[#E8F3FF] px-2 py-1 rounded-[6px]">
                2025학년도
              </span>
              <h1 className="text-[24px] font-bold text-[#191F28] mt-3 mb-2">
                목표 대학 선택
              </h1>
              <p className="text-[#8B95A1] text-[15px]">
                합격 컷 및 분석 데이터
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3182F6]"></div>
              </div>
            ) : (
              // ✨ [핵심 수정] style 속성으로 강제 2열 그리드 적용 ✨
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {universities.map((uni) => (
                  <div 
                    key={uni}
                    onClick={() => handleSelectUni(uni)}
                    className="bg-white rounded-[20px] p-4 cursor-pointer 
                               shadow-sm active:scale-95 transition-all duration-200 
                               flex flex-col items-center justify-center h-[140px] border border-transparent hover:border-blue-100"
                  >
                    {/* 로고 박스 (크기 고정) */}
                    <div className="w-[50px] h-[50px] mb-3 flex items-center justify-center">
                      <img 
                        src={`/logos/${uni}.png`} 
                        alt={uni}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = "https://cdn-icons-png.flaticon.com/512/807/807262.png"; 
                        }}
                      />
                    </div>
                    
                    {/* 학교 이름 */}
                    <span className="text-[16px] font-bold text-[#333D4B] text-center leading-tight">
                      {uni}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* === 화면 2: 리스트 모드 (박스 디자인 제거됨) === */}
        {selectedUni && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setSelectedUni(null); setResults([]); }}
                  className="bg-white p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                </button>
                <div className="flex items-center gap-3">
                   <img src={`/logos/${selectedUni}.png`} alt="logo" className="w-10 h-10 object-contain" 
                        onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/807/807262.png"}/>
                   <div>
                     <h1 className="text-2xl font-bold text-gray-900">{selectedUni}</h1>
                     <p className="text-xs text-gray-500">총 {results.length}개의 데이터가 있습니다</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-5 text-center w-20">연도</th>
                      <th className="px-6 py-5 text-center w-24">시험시간</th>
                      <th className="px-6 py-5 pl-8">모집단위 (학과)</th>
                      <th className="px-6 py-5 text-center">경쟁률</th>
                      <th className="px-6 py-5 text-center">평균점수</th>
                      <th className="px-6 py-5 text-center">커트라인</th>
                      <th className="px-6 py-5 text-center">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {results.map((item) => (
                      <tr 
                        key={item.id} 
                        onClick={() => router.push(`/result/${item.id}`)}
                        className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                      >
                        {/* 연도 */}
                        <td className="px-6 py-5 text-center text-gray-500">
                            {item.year}
                        </td>
                        
                        {/* 시험시간 (박스 제거 -> 일반 텍스트) */}
                        <td className="px-6 py-5 text-center text-gray-500 font-medium">
                            {item.exam_time || '-'}
                        </td>
                        
                        {/* 학과 */}
                        <td className="px-6 py-5 pl-8">
                          <div className="font-bold text-gray-800 text-base group-hover:text-blue-600 transition-colors">
                            {item.department}
                          </div>
                        </td>
                        
                        <td className="px-6 py-5 text-center text-gray-500">
                          {item.competition_rate ? `${item.competition_rate}:1` : '-'}
                        </td>
                        <td className="px-6 py-5 text-center font-bold text-gray-700">
                          {item.avg_score || '-'}
                        </td>
                        <td className="px-6 py-5 text-center">
                          {item.cut_score ? (
                            <span className="text-red-500 font-bold">
                              {item.cut_score}
                            </span>
                          ) : '-'}
                        </td>
                        
                        {/* 상태 (박스 제거 -> 텍스트 링크 스타일) */}
                         <td className="px-6 py-5 text-center">
                          <span className="text-blue-600 font-bold hover:underline">
                            분석 →
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {results.length === 0 && (
                <div className="p-16 text-center">
                   <div className="text-4xl mb-4">📭</div>
                   <p className="text-gray-400">등록된 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}