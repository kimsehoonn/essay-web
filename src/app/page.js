'use client';

import { useEffect, useState, Suspense } from 'react'; // Suspense 추가
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation'; // useSearchParams 추가

// 메인 로직 컴포넌트
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL에서 학교 이름 가져오기 (없으면 null)
  const selectedUni = searchParams.get('uni');

  const [universities, setUniversities] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true); // 초기 로딩
  const [resultsLoading, setResultsLoading] = useState(false); // 결과 로딩

  const [examTimes, setExamTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('전체'); 
  const [myScore, setMyScore] = useState('');

  const isScoreEnabled = selectedTime !== '전체' && selectedTime !== null;

  // 1. 학교 목록 가져오기 (최초 1회)
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

  // 2. 선택된 학교 데이터 가져오기 (URL의 selectedUni가 바뀔 때마다 실행)
  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedUni) {
        setResults([]); // 학교 선택 안됨 -> 리스트 초기화
        return;
      }

      setResultsLoading(true);
      // 상태 초기화
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
  }, [selectedUni]); // selectedUni가 변경될 때만 실행됨

  // 3. 학교 선택 핸들러 (이제 URL을 변경함)
  const handleSelectUni = (uniName) => {
    // URL을 변경하면 위 useEffect가 감지해서 데이터를 불러옴
    router.push(`/?uni=${uniName}`);
  };

  // 4. 뒤로가기 핸들러 (UI 버튼용)
  const handleBack = () => {
    router.push('/'); // 홈으로 이동
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
                합격 컷 및 분석 데이터
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
                    className="bg-white rounded-[24px] p-6 cursor-pointer 
                               shadow-sm active:scale-95 transition-all duration-200 
                               flex flex-col items-center justify-center h-[180px] border border-transparent hover:border-blue-100"
                  >
                    <div className="w-[300px] h-[300px] mb-4 flex items-center justify-center">
                      <img 
                        src={`/logos/${uni}.png`} 
                        alt={uni}
                        className="w-full h-full object-contain drop-shadow-sm"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = "https://cdn-icons-png.flaticon.com/512/807/807262.png"; 
                        }}
                      />
                    </div>
                    <span className="text-[18px] font-bold text-[#333D4B] text-center leading-tight">
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
            <div className="sticky top-0 z-20 bg-[#F2F4F6]/95 backdrop-blur-md pb-4 pt-2 -mx-5 px-5 mb-2 space-y-4">
              
              {/* 1-1. 학교 정보 (뒤로가기 버튼 기능 수정됨) */}
              <div className="flex items-center justify-between bg-white p-4 rounded-[24px] shadow-sm border border-blue-50">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleBack} // URL 기반 뒤로가기
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
                <span className="text-[13px] text-[#8B95A1]">총 {results.length}개</span>
              </div>

              {/* 1-2. 시험 시간 선택 탭 */}
              <div>
                <div className="flex justify-between items-end mb-2 ml-1 px-1">
                  <h3 className="text-[13px] font-bold text-[#6B7684]">1. 시험 시간을 선택하세요</h3>
                </div>
                <div className="bg-[#E5E8EB] p-1 rounded-[16px] flex gap-1 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => { setSelectedTime('전체'); setMyScore(''); }}
                    className={`flex-1 min-w-[70px] py-2.5 rounded-[12px] text-[14px] font-bold transition-all duration-200 text-center whitespace-nowrap
                      ${selectedTime === '전체' 
                        ? 'bg-white text-[#333D4B] shadow-sm' 
                        : 'text-[#8B95A1] hover:text-[#6B7684]'
                      }`}
                  >
                    전체
                  </button>
                  {examTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`flex-1 min-w-[70px] py-2.5 rounded-[12px] text-[14px] font-bold transition-all duration-200 text-center whitespace-nowrap
                        ${selectedTime === time 
                          ? 'bg-white text-[#3182F6] shadow-sm ring-2 ring-blue-100' 
                          : 'text-[#8B95A1] hover:text-[#6B7684]'
                        }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1-3. 점수 입력창 */}
              <div>
                <div className="flex justify-between items-end mb-2 ml-1 px-1">
                  <h3 className={`text-[13px] font-bold transition-colors ${isScoreEnabled ? 'text-[#3182F6]' : 'text-[#6B7684]'}`}>
                    2. 내 점수를 입력하세요
                  </h3>
                  {!isScoreEnabled && <span className="text-[11px] text-[#F04452] animate-pulse">시간 선택 필요!</span>}
                </div>
                <div 
                  className={`flex items-center justify-between px-5 py-3 rounded-[20px] border transition-all duration-300
                    ${isScoreEnabled 
                      ? 'bg-white border-[#3182F6] shadow-md ring-4 ring-blue-50' 
                      : 'bg-gray-100 border-gray-200 opacity-60'
                    }`}
                >
                  <span className={`text-[15px] font-bold ${isScoreEnabled ? 'text-[#333D4B]' : 'text-gray-400'}`}>
                    ✍️ 예상 점수
                  </span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={myScore}
                      onChange={handleScoreChange}
                      disabled={!isScoreEnabled}
                      placeholder="0"
                      className={`bg-transparent text-[24px] font-bold w-[80px] text-right focus:outline-none
                        ${isScoreEnabled ? 'text-[#3182F6] placeholder-gray-300' : 'text-gray-400'}`}
                    />
                    <span className={`text-[14px] font-medium mt-1 ${isScoreEnabled ? 'text-[#333D4B]' : 'text-gray-400'}`}>점</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 데이터 표 */}
            <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-gray-100 mt-4">
              {resultsLoading ? (
                 <div className="py-20 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3182F6] mx-auto"></div>
                 </div>
              ) : (
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
                        
                        let badgeClass = "bg-[#F2F4F6] text-[#B0B8C1]";
                        let badgeText = "입력대기";
                        
                        if (myScore !== '') {
                          if (score >= avg) {
                            badgeClass = "bg-[#E8F5E9] text-[#2E7D32]"; badgeText = "✅ 안정권";
                          } else if (score >= cut) {
                            badgeClass = "bg-[#FFF8E1] text-[#F9A825]"; badgeText = "⚡️ 소신지원";
                          } else {
                            badgeClass = "bg-[#FFEBEE] text-[#C62828]"; badgeText = "🔥 위험";
                          }
                        }

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

                            <td className="py-4 pr-6 align-middle">
                              {myScore === '' ? (
                                <div className="text-center text-[12px] text-[#B0B8C1] bg-gray-50 py-1.5 px-3 rounded-full border border-gray-100">
                                  점수 확인
                                </div>
                              ) : (
                                <div className="flex flex-col items-end gap-1">
                                  <div className={`px-2.5 py-1 rounded-[6px] text-[12px] font-bold flex items-center gap-1 ${badgeClass}`}>
                                    {badgeText}
                                  </div>
                                  <div className="flex items-center gap-2 w-full justify-end mt-1">
                                     <span className={`text-[11px] font-medium ${diff > 0 ? 'text-[#2E7D32]' : 'text-[#C62828]'}`}>
                                       (컷 {diffText})
                                     </span>
                                     <div className="w-[60px] h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
                                        <div 
                                          className={`absolute top-0 left-0 h-full transition-all duration-500 rounded-full ${score >= cut ? 'bg-[#3182F6]' : 'bg-[#F04452]'}`}
                                          style={{ width: `${Math.min((score / (avg + 10)) * 100, 100)}%` }}
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
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Suspense로 감싸서 내보내기 (배포 에러 방지용)
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F2F4F6] p-10 text-center">로딩중...</div>}>
      <HomeContent />
    </Suspense>
  );
}