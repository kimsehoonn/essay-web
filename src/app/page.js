'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [universities, setUniversities] = useState([]);
  const [selectedUni, setSelectedUni] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // 추가된 상태: 시험 시간 목록 & 선택된 시간
  const [examTimes, setExamTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);

  // 전역 내 점수
  const [myScore, setMyScore] = useState('');

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

  const handleSelectUni = async (uniName) => {
    setLoading(true);
    setSelectedUni(uniName);
    setMyScore(''); 
    setSelectedTime(null);
    
    const { data } = await supabase
      .from('exam_results')
      .select('*')
      .eq('university', uniName)
      .order('year', { ascending: false })
      .order('exam_time', { ascending: true });
    
    if (data) {
      setResults(data);
      const times = [...new Set(data.map(item => item.exam_time).filter(t => t))];
      setExamTimes(times);
      if (times.length > 0) setSelectedTime(times[0]);
    }
    setLoading(false);
  };

  const handleScoreChange = (e) => {
    let val = e.target.value;
    if (Number(val) > 100) val = '100';
    setMyScore(val);
  };

  const filteredResults = results.filter(item => 
    selectedTime === '전체' ? true : item.exam_time === selectedTime
  );

  return (
    <main className="min-h-screen bg-[#F2F4F6] p-5 md:p-10 font-sans tracking-tight text-[#191F28]">
      <div className="max-w-5xl mx-auto pt-4">
        
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
                학교별/시간별 합격 분석
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3182F6]"></div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {universities.map((uni) => (
                  <div 
                    key={uni}
                    onClick={() => handleSelectUni(uni)}
                    className="bg-white rounded-[20px] p-4 cursor-pointer 
                               shadow-sm active:scale-95 transition-all duration-200 
                               flex flex-col items-center justify-center h-[140px] border border-transparent hover:border-blue-100"
                  >
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
                    <span className="text-[16px] font-bold text-[#333D4B] text-center leading-tight">
                      {uni}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === 화면 2: 결과 리스트 모드 === */}
        {selectedUni && (
          <div className="animate-fade-in-up">
            
            {/* 1. 상단 컨트롤 패널 */}
            <div className="sticky top-0 z-20 bg-[#F2F4F6]/95 backdrop-blur-md pb-4 pt-2 -mx-5 px-5 mb-2 space-y-3">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 bg-white p-4 rounded-[24px] shadow-sm border border-blue-50">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setSelectedUni(null); setResults([]); }}
                    className="bg-[#F2F4F6] p-2 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#333D4B" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2 overflow-hidden">
                     <img src={`/logos/${selectedUni}.png`} alt="logo" className="w-10 h-10 object-contain bg-white rounded-[10px] p-1 border border-gray-100 flex-shrink-0" 
                          onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/807/807262.png"}/>
                     <h1 className="text-[18px] font-bold text-[#191F28] whitespace-nowrap">{selectedUni}</h1>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#F9FAFB] px-3 py-1.5 rounded-[16px] border border-gray-200 self-end md:self-auto w-full md:w-auto justify-end">
                  <span className="text-[14px] font-bold text-[#333D4B] whitespace-nowrap">✍️ 내 점수:</span>
                  <input 
                    type="number" 
                    value={myScore}
                    onChange={handleScoreChange}
                    placeholder="0"
                    className="bg-transparent text-[18px] font-bold text-[#3182F6] w-[50px] text-center focus:outline-none placeholder-gray-300"
                  />
                  <span className="text-[13px] font-medium text-[#8B95A1]">점</span>
                </div>
              </div>

              {/* 시간 선택 탭 */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setSelectedTime('전체')}
                  className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all
                    ${selectedTime === '전체' 
                      ? 'bg-[#333D4B] text-white shadow-md' 
                      : 'bg-white text-[#8B95A1] border border-gray-200 hover:bg-gray-50'}`}
                >
                  전체 보기
                </button>
                {examTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all
                      ${selectedTime === time 
                        ? 'bg-[#3182F6] text-white shadow-md' 
                        : 'bg-white text-[#59606a] border border-gray-200 hover:bg-gray-50'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 데이터 표 */}
            <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-gray-100 text-[13px] text-[#8B95A1]">
                      <th className="py-4 pl-6 font-medium text-center w-[60px]">시간</th>
                      <th className="py-4 px-2 font-medium">모집단위 (학과)</th>
                      <th className="py-4 px-2 font-medium text-center w-[50px]">예비</th>
                      <th className="py-4 px-2 text-center font-medium w-[60px]">경쟁률</th>
                      <th className="py-4 px-2 text-center font-medium w-[60px]">평균</th>
                      <th className="py-4 px-2 text-center font-medium w-[60px]">컷</th>
                      <th className="py-4 pr-6 text-center font-medium w-[150px]">분석 결과</th>
                    </tr>
                  </thead>
                  <tbody className="text-[15px]">
                    {filteredResults.length > 0 ? (
                      filteredResults.map((item) => {
                        const cut = item.cut_score || 0;
                        const avg = item.avg_score || 0;
                        const score = Number(myScore);
                        
                        // 뱃지 스타일 로직
                        let badgeClass = "bg-[#F2F4F6] text-[#B0B8C1]"; // 기본
                        let badgeText = "입력대기";
                        
                        if (myScore !== '') {
                          if (score >= avg) {
                            badgeClass = "bg-[#E8F5E9] text-[#2E7D32]"; // 안정 (초록)
                            badgeText = "✅ 안정권";
                          } else if (score >= cut) {
                            badgeClass = "bg-[#FFF8E1] text-[#F9A825]"; // 소신 (노랑)
                            badgeText = "⚡️ 소신지원";
                          } else {
                            badgeClass = "bg-[#FFEBEE] text-[#C62828]"; // 위험 (빨강)
                            badgeText = "🔥 위험";
                          }
                        }

                        // 점수 차이 계산
                        const diff = (score - cut).toFixed(1);
                        const diffText = diff > 0 ? `+${diff}` : diff;

                        return (
                          <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-[#F2F4F6] transition-colors group">
                            <td className="py-4 pl-6 text-center">
                              <span className="bg-[#E8F3FF] text-[#3182F6] px-2 py-1 rounded-[6px] text-[12px] font-bold">
                                {item.exam_time || '-'}
                              </span>
                            </td>
                            <td className="py-4 px-2">
                              <span className="font-bold text-[#191F28] text-[16px]">{item.department}</span>
                            </td>
                            <td className="py-4 px-2 text-center font-medium text-[#4E5968]">{item.reserve_rank || '-'}</td>
                            <td className="py-4 px-2 text-center text-[#8B95A1] text-[14px]">{item.competition_rate || '-'}</td>
                            <td className="py-4 px-2 text-center font-bold text-[#3182F6]">{item.avg_score || '-'}</td>
                            <td className="py-4 px-2 text-center font-bold text-[#F04452]">{item.cut_score || '-'}</td>

                            {/* === 상태 뱃지 및 그래프 === */}
                            <td className="py-4 pr-6 align-middle">
                              {myScore === '' ? (
                                <div className="text-center text-[12px] text-[#B0B8C1] bg-gray-50 py-1.5 px-3 rounded-full border border-gray-100">
                                  점수를 입력하세요
                                </div>
                              ) : (
                                <div className="flex flex-col items-end gap-1">
                                  {/* 1. 디자인된 뱃지 */}
                                  <div className={`px-2.5 py-1 rounded-[6px] text-[12px] font-bold flex items-center gap-1 ${badgeClass}`}>
                                    {badgeText}
                                  </div>
                                  
                                  {/* 2. 점수 차이 및 미니 바 */}
                                  <div className="flex items-center gap-2 w-full justify-end mt-1">
                                     <span className={`text-[11px] font-medium ${diff > 0 ? 'text-[#2E7D32]' : 'text-[#C62828]'}`}>
                                       (컷 {diffText})
                                     </span>
                                     {/* 미니 바 그래프 (배경) */}
                                     <div className="w-[60px] h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
                                        <div 
                                          className={`absolute top-0 left-0 h-full transition-all duration-500 rounded-full ${score >= cut ? 'bg-[#3182F6]' : 'bg-[#F04452]'}`}
                                          style={{ width: `${Math.min((score / (avg + 10)) * 100, 100)}%` }} // 평균보다 좀 더 높게 잡아서 시각화
                                        ></div>
                                     </div>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-20 text-center text-[#8B95A1]">
                          해당 시간의 시험 데이터가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}