'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ResultDetail() {
  const params = useParams();
  const router = useRouter();
  
  // 상태 관리
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' or 'community'
  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]); // 댓글 목록
  const [myScore, setMyScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // 댓글 입력 폼 상태
  const [form, setForm] = useState({ nickname: '', password: '', content: '' });

  // 1. 데이터 불러오기 (학과 정보 + 댓글)
  useEffect(() => {
    const fetchData = async () => {
      // 학과 정보 가져오기
      const { data: result } = await supabase
        .from('exam_results')
        .select('*')
        .eq('id', params.id)
        .single();

      if (result) {
        setData(result);
        setMyScore(result.cut_score ? result.cut_score : 70);
      }

      // 댓글 가져오기
      fetchComments();
      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  // 댓글 목록 새로고침 함수
  const fetchComments = async () => {
    const { data: commentList } = await supabase
      .from('comments')
      .select('*')
      .eq('exam_id', params.id)
      .order('created_at', { ascending: false }); // 최신순
    setComments(commentList || []);
  };

  // 댓글 등록 함수
  const handleSubmitComment = async (e) => {
    e.preventDefault(); // 새로고침 방지
    if (!form.nickname || !form.content || !form.password) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    const { error } = await supabase
      .from('comments')
      .insert([
        { 
          exam_id: params.id, 
          nickname: form.nickname, 
          password: form.password, 
          content: form.content 
        }
      ]);

    if (error) {
      alert("댓글 등록 실패 ㅠㅠ");
      console.error(error);
    } else {
      // 성공 시 입력창 초기화 및 목록 갱신
      setForm({ ...form, content: '' }); 
      fetchComments();
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
  };

  if (loading) return <div className="p-10 text-center">로딩 중... ⏳</div>;
  if (!data) return <div className="p-10 text-center">데이터를 찾을 수 없습니다.</div>;

  // 차트 데이터 및 메시지 로직 (기존 유지)
  const chartData = [
    { name: '커트라인', score: data.cut_score || 0, fill: '#ff6b6b' },
    { name: '합격평균', score: data.avg_score || 0, fill: '#4dabf7' },
    { name: '나의점수', score: myScore, fill: '#51cf66' },
  ];
  
  const getAnalysisMessage = () => {
    if (myScore >= data.avg_score) return { text: "🟢 안정권입니다!", sub: "합격자 평균보다 높습니다." };
    if (myScore >= data.cut_score) return { text: "🟡 소신 지원 가능", sub: "커트라인은 넘겼으나 평균보다는 낮습니다." };
    return { text: "🔴 위험합니다", sub: "작년 커트라인보다 점수가 부족합니다." };
  };
  const analysis = getAnalysisMessage();


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* 상단 헤더 */}
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-black mb-6 flex items-center gap-1">
          ← 뒤로 가기
        </button>

        <div className="bg-white rounded-t-2xl p-6 md:p-8 shadow-sm border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">{data.year}년 {data.exam_time}</span>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{data.university} {data.department}</h1>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-sm text-gray-500">경쟁률</div>
              <div className="text-xl font-bold">{data.competition_rate}:1</div>
            </div>
          </div>
        </div>

        {/* 탭 버튼 영역 */}
        <div className="flex bg-white border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-4 text-center font-bold text-sm md:text-base transition-colors ${activeTab === 'analysis' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            📊 합격 확률 분석
          </button>
          <button 
            onClick={() => setActiveTab('community')}
            className={`flex-1 py-4 text-center font-bold text-sm md:text-base transition-colors ${activeTab === 'community' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            💬 실시간 토크 ({comments.length})
          </button>
        </div>

        {/* === 탭 1: 합격 분석 === */}
        {activeTab === 'analysis' && (
          <div className="bg-white rounded-b-2xl shadow-lg p-6 md:p-8 animate-fade-in">
            {/* 점수 입력 */}
            <div className="mb-10 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex justify-between">
                <span>✍️ 내 예상 점수 입력</span>
                <span className="text-blue-600 text-lg">{myScore}점</span>
              </label>
              <input 
                type="range" min="0" max="100" value={myScore} 
                onChange={(e) => setMyScore(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* 결과 메시지 */}
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">{analysis.text}</h2>
              <p className="text-gray-500">{analysis.sub}</p>
            </div>

            {/* 그래프 */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" width={60} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="score" barSize={24} radius={[0, 10, 10, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* === 탭 2: 커뮤니티 (새로운 기능!) === */}
        {activeTab === 'community' && (
          <div className="bg-white rounded-b-2xl shadow-lg p-6 md:p-8 animate-fade-in">
            
            {/* 댓글 입력 폼 */}
            <form onSubmit={handleSubmitComment} className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex gap-2 mb-2">
                <input 
                  type="text" placeholder="닉네임" 
                  className="w-1/3 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  value={form.nickname}
                  onChange={(e) => setForm({...form, nickname: e.target.value})}
                />
                <input 
                  type="password" placeholder="비번(삭제용)" 
                  className="w-1/3 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="이 학과 논술 어땠나요? 자유롭게 이야기해보세요." 
                  className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  value={form.content}
                  onChange={(e) => setForm({...form, content: e.target.value})}
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                  등록
                </button>
              </div>
            </form>

            {/* 댓글 리스트 */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  아직 작성된 글이 없습니다. <br/>첫 번째 주인공이 되어보세요! 🎉
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-900 text-sm">{comment.nickname}</span>
                      <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}