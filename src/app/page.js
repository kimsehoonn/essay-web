'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check, AlertCircle, Zap } from 'lucide-react';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const selectedUni = searchParams.get('uni');

  const [universities, setUniversities] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);

  const [examTimes, setExamTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('전체'); 
  const [myScore, setMyScore] = useState('');

  const isScoreEnabled = selectedTime !== '전체' && selectedTime !== null;

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

  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedUni) {
        setResults([]);
        return;
      }

      setResultsLoading(true);
      setMyScore('');
      setSelectedTime('전체');

      const { data } = await supabase
        .from('exam_results')
        .select('*')
        .eq('university', selectedUni)
        .order('year', { ascending: false })
        .order('exam_time', { ascending: true });
      
      if (data) {
        setResults(data);
        const times = [...new Set(data.map(item => item.exam_time).filter(t => t))];
        setExamTimes(times);
      }
      setResultsLoading(false);
    };

    fetchResults();
  }, [selectedUni]);

  const handleSelectUni = (uniName) => {
    router.push(`/?uni=${uniName}`);
  };

  const handleBack = () => {
    router.push('/');
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
    <main className="min-h-screen bg-[#F9FAFB] font-sans text-[#191F28]">
      <div className="max-w-[600px] mx-auto min-h-screen bg-white shadow-[0_0_40px_rgba(0,0,0,0.02)]">
        
        {/* === 화면 1: 학교 선택 모드 === */}
        {!selectedUni && (
          <div className="animate-fade-in-up p-6 pt-12">
            <div className="mb-10">
              <span className="text-[#3182F6] font-bold text-[13px] bg-[#E8F3FF] px-3 py-1.5 rounded-[8px]">
                2025학년도 대비
              </span>
              <h1 className="text-[28px] font-bold text-[#191F28] mt-4 mb-3 leading-[1.3]">
                어떤 대학의<br/>합격 컷이 궁금한가요?
              </h1>
              <p className="text-[#8B95A1] text-[16px]">
                가장 정확한 기출 분석 데이터를 확인하세요
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-32">
                <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-t-transparent border-[#3182F6]"></div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {universities.map((uni) => (
                  <div 
                    key={uni}
                    onClick={() => handleSelectUni(uni)}
                    className="group bg-white rounded-[24px] p-5 cursor-pointer 
                               border border-[#E5E8EB] hover:border-[#3182F6] hover:shadow-lg hover:shadow-blue-500/5 
                               active:scale-[0.98] transition-all duration-200 
                               flex items-center gap-7" 
                               /* ✨ 수정됨: gap-5 -> gap-7 (간격 확보) */
                  >
                    {/* 로고 박스 */}
                    <div className="w-[68px] h-[68px] bg-[#F9FAFB] rounded-[20px] flex items-center justify-center flex-shrink-0 border border-[#F2F4F6]">
                      <img 
                        src={`/logos/${uni}.png`} 
                        alt={uni}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = "https://cdn-icons-png.flaticon.com/512/807/807262.png"; 
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 py-1">
                      <h2 className="text-[19px] font-bold text-[#333D4B] group-hover:text-[#3182F6] transition-colors mb-1">
                        {uni}
                      </h2>
                      <p className="text-[14px] text-[#8B95A1]">
                        합격 분석 결과 보기
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-[#D1D6DB]" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === 화면 2: 결과 리스트 모드 === */}
        {selectedUni && (
          <div className="animate-fade-in-up pb-20">
            
            {/* 1. 상단 헤더 & 컨트롤 (Sticky) */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-[#F2F4F6]">
              <div className="p-5 pb-6">
                
                {/* 네비게이션 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleBack}
                      className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 text-[#333D4B]" />
                    </button>
                    <div className="flex items-center gap-3">
                       <div className="w-[42px] h-[42px] bg-white rounded-[14px] border border-[#E5E8EB] flex items-center justify-center overflow-hidden shadow-sm">
                         <img 
                            src={`/logos/${selectedUni}.png`} 
                            alt="logo" 
                            className="w-full h-full object-contain p-1"
                            onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/807/807262.png"}
                         />
                       </div>
                       <h1 className="text-[22px] font-bold text-[#191F28]">{selectedUni}</h1>
                    </div>
                  </div>
                </div>

                {/* 컨트롤 패널 */}
                <div className="space-y-5">
                  {/* 시간 선택 */}
                  <div>
                    <h3 className="text-[13px] font-bold text-[#8B95A1] mb-2.5 ml-1">1. 시험 시간 선택</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
                      <button
                        onClick={() => { setSelectedTime('전체'); setMyScore(''); }}
                        className={`flex-shrink-0 px-5 py-2.5 rounded-[16px] text-[15px] font-bold transition-all border
                          ${selectedTime === '전체' 
                            ? 'bg-[#333D4B] text-white border-[#333D4B] shadow-md' 
                            : 'bg-white text-[#6B7684] border-[#E5E8EB] hover:bg-gray-50'
                          }`}
                      >
                        전체
                      </button>
                      {examTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`flex-shrink-0 px-5 py-2.5 rounded-[16px] text-[15px] font-bold transition-all border
                            ${selectedTime === time 
                              ? 'bg-[#3182F6] text-white border-[#3182F6] shadow-md' 
                              : 'bg-white text-[#6B7684] border-[#E5E8EB] hover:bg-gray-50'
                            }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ✨ 수정됨: 명암 그라데이션 구분선 (Divider) ✨ */}
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-70 my-2"></div>

                  {/* 점수 입력 */}
                  <div>
                    <div className="flex justify-between items-end mb-2 ml-1">
                      <h3 className={`text-[13px] font-bold transition-colors ${isScoreEnabled ? 'text-[#3182F6]' : 'text-[#8B95A1]'}`}>
                        2. 내 점수 입력
                      </h3>
                      {!isScoreEnabled && <span className="text-[12px] text-[#F04452] font-medium animate-pulse">☝️ 시간 먼저 선택해주세요</span>}
                    </div>
                    
                    <div 
                      className={`relative flex items-center justify-between px-6 py-4 rounded-[20px] border-2 transition-all duration-300
                        ${isScoreEnabled 
                          ? 'bg-white border-[#3182F6] shadow-lg shadow-blue-100' 
                          : 'bg-[#F9FAFB] border-[#F2F4F6] opacity-60'
                        }`}
                    >
                      <span className={`text-[16px] font-bold ${isScoreEnabled ? 'text-[#333D4B]' : 'text-[#B0B8C1]'}`}>
                        예상 점수
                      </span>
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          value={myScore}
                          onChange={handleScoreChange}
                          disabled={!isScoreEnabled}
                          placeholder="0"
                          className={`bg-transparent text-[28px] font-bold w-[80px] text-right focus:outline-none font-mono
                            ${isScoreEnabled ? 'text-[#3182F6] placeholder-gray-200' : 'text-gray-300'}`}
                        />
                        <span className={`text-[16px] font-bold mt-1.5 ${isScoreEnabled ? 'text-[#333D4B]' : 'text-gray-300'}`}>점</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. 데이터 리스트 */}
            <div className="px-5 pt-6">
              <div className="mb-3 flex justify-between items-end px-1">
                <span className="text-[14px] font-bold text-[#333D4B]">분석 결과</span>
                <span className="text-[12px] text-[#8B95A1]">총 {filteredResults.length}개 학과</span>
              </div>

              {resultsLoading ? (
                 <div className="py-32 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-t-transparent border-[#3182F6] mx-auto"></div>
                 </div>
              ) : (
                <div className="space-y-4">
                  {filteredResults.length > 0 ? (
                    filteredResults.map((item) => {
                      const cut = item.cut_score || 0;
                      const avg = item.avg_score || 0;
                      const score = Number(myScore);
                      
                      let statusColor = "#E5E8EB";
                      let statusIcon = null;
                      let statusText = "입력대기";
                      
                      if (myScore !== '') {
                        if (score >= avg) {
                          statusColor = "#E8F5E9"; 
                          statusIcon = <Check className="w-3.5 h-3.5 text-[#2E7D32]" />;
                          statusText = <span className="text-[#2E7D32] font-bold">안정</span>;
                        } else if (score >= cut) {
                          statusColor = "#FFF8E1";
                          statusIcon = <Zap className="w-3.5 h-3.5 text-[#F9A825]" />;
                          statusText = <span className="text-[#F9A825] font-bold">소신</span>;
                        } else {
                          statusColor = "#FFEBEE";
                          statusIcon = <AlertCircle className="w-3.5 h-3.5 text-[#C62828]" />;
                          statusText = <span className="text-[#C62828] font-bold">위험</span>;
                        }
                      }

                      const diff = (score - cut).toFixed(1);
                      const diffText = diff > 0 ? `+${diff}` : diff;

                      return (
                        <div key={item.id} className="bg-white rounded-[24px] p-6 border border-[#F2F4F6] shadow-sm hover:shadow-md transition-shadow">
                          
                          <div className="flex justify-between items-start mb-5">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="bg-[#F2F4F6] text-[#6B7684] px-2 py-0.5 rounded-[6px] text-[11px] font-bold">
                                  {item.year}
                                </span>
                                <div className="w-[1px] h-2.5 bg-gray-200"></div>
                                <span className={`px-2 py-0.5 rounded-[6px] text-[11px] font-bold 
                                  ${selectedTime === item.exam_time ? 'bg-[#E8F3FF] text-[#3182F6]' : 'bg-[#F9FAFB] text-[#8B95A1]'}`}>
                                  {item.exam_time || '-'}
                                </span>
                              </div>
                              <h3 className="text-[18px] font-bold text-[#191F28] leading-tight">{item.department}</h3>
                            </div>
                            
                            {myScore !== '' ? (
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px]" style={{ backgroundColor: statusColor }}>
                                  {statusIcon}
                                  <span className="text-[13px]">{statusText}</span>
                                </div>
                                <span className={`text-[11px] font-medium mt-1 ${diff > 0 ? 'text-[#2E7D32]' : 'text-[#C62828]'}`}>
                                  (컷 {diffText})
                                </span>
                              </div>
                            ) : (
                              <span className="text-[12px] text-[#B0B8C1] bg-[#F9FAFB] px-3 py-1.5 rounded-[12px]">
                                점수 미입력
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-4 gap-4 border-t border-[#F2F4F6] pt-4">
                            <div className="text-center">
                              <div className="text-[11px] text-[#8B95A1] mb-1">예비</div>
                              <div className="text-[15px] font-medium text-[#4E5968]">{item.reserve_rank || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[11px] text-[#8B95A1] mb-1">경쟁률</div>
                              <div className="text-[15px] font-medium text-[#4E5968]">{item.competition_rate || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[11px] text-[#8B95A1] mb-1">평균</div>
                              <div className="text-[15px] font-bold text-[#3182F6]">{item.avg_score || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[11px] text-[#8B95A1] mb-1">컷</div>
                              <div className="text-[15px] font-bold text-[#F04452]">{item.cut_score || '-'}</div>
                            </div>
                          </div>

                          {myScore !== '' && (
                            <div className="mt-4 pt-1">
                              <div className="w-full h-2 bg-[#F2F4F6] rounded-full overflow-hidden relative">
                                <div className="absolute top-0 w-[2px] h-full bg-[#F04452] z-10 opacity-50" style={{ left: `${Math.min(item.cut_score, 100)}%` }}></div>
                                <div 
                                  className={`absolute top-0 left-0 h-full transition-all duration-500 rounded-full ${score >= item.cut_score ? 'bg-[#3182F6]' : 'bg-[#F04452]'}`}
                                  style={{ width: `${Math.min((score / (item.avg_score + 10)) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })
                  ) : (
                    <div className="py-20 text-center bg-white rounded-[24px] shadow-sm border border-[#F2F4F6]">
                      <p className="text-[#8B95A1]">해당 시간의 데이터가 없습니다.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9FAFB]"></div>}>
      <HomeContent />
    </Suspense>
  );
}