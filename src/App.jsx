import React, { useState, useEffect, useRef } from 'react';
import { FileText, ShieldAlert, CheckCircle, Bot, Users, History, X, Eye, Sparkles, Building, MessageSquare, Clock, Edit3, User, ChevronDown, Save, ThumbsUp, ThumbsDown, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react';

// -----------------------------------------------------------------------------
// Constants & Mock Data
// -----------------------------------------------------------------------------

const STAKEHOLDERS = [
  { id: 's1', name: 'A社 (原作出版)', type: 'Publisher', role: '幹事', status: 'approved', color: 'bg-red-100 text-red-700', share: 30 },
  { id: 's2', name: 'B社 (TV局)', type: 'Broadcaster', role: '放送', status: 'approved', color: 'bg-blue-100 text-blue-700', share: 20 },
  { id: 's3', name: 'C社 (映画配給)', type: 'Distributor', role: '配給', status: 'pending', color: 'bg-green-100 text-green-700', share: 15 },
  { id: 's4', name: 'D社 (配信PF)', type: 'Streaming', role: '配信', status: 'rejected', color: 'bg-purple-100 text-purple-700', share: 10 },
  { id: 's5', name: 'E社 (アニメスタジオ)', type: 'Studio', role: '制作', status: 'rejected', color: 'bg-orange-100 text-orange-700', share: 10 },
  { id: 's6', name: 'F社 (玩具メーカー)', type: 'Merch', role: '商品化', status: 'approved', color: 'bg-yellow-100 text-yellow-700', share: 5 },
  { id: 's7', name: 'G社 (レコード会社)', type: 'Music', role: '音楽', status: 'approved', color: 'bg-pink-100 text-pink-700', share: 3 },
  { id: 's8', name: 'H社 (広告代理店)', type: 'Agency', role: '調整', status: 'pending', color: 'bg-gray-100 text-gray-700', share: 3 },
  { id: 's9', name: 'I社 (ゲーム会社)', type: 'Game', role: 'ゲーム化', status: 'approved', color: 'bg-indigo-100 text-indigo-700', share: 2 },
  { id: 's10', name: 'J社 (海外商社)', type: 'Overseas', role: '海外', status: 'pending', color: 'bg-teal-100 text-teal-700', share: 2 },
];

const INITIAL_CONTRACT = [
  {
    id: 'art1',
    title: '第1条（名称・目的）',
    content: '当事者は、本作品「プロジェクトX」のアニメーション制作及び事業展開を共同して行うことを目的として、任意組合である「プロジェクトX製作委員会」を組成する。',
    status: 'unchanged',
    conflicts: [],
    pendingProposal: null 
  },
  {
    id: 'art2',
    title: '第2条（事務所）',
    content: '本委員会の主たる事務所は、幹事会社であるA社の本店所在地に置くものとする。',
    status: 'unchanged',
    conflicts: [],
    pendingProposal: null
  },
  {
    id: 'art3',
    title: '第3条（出資）',
    content: '各当事者の出資総額は金5億円とし、各当事者の出資金額及び持分比率は別紙1の通りとする。追加出資が必要となった場合、協議の上決定する。',
    status: 'unchanged',
    conflicts: [],
    pendingProposal: null
  },
  {
    id: 'art4',
    title: '第4条（業務分担）',
    content: '各当事者は、その得意分野に応じ、本作品の制作及び利用に関する業務（窓口権）を分担する。具体的な業務分担は別紙2の通りとする。',
    status: 'unchanged',
    conflicts: [],
    pendingProposal: null
  },
  {
    id: 'art5',
    title: '第5条（純利益分配）',
    content: '本作品の利用により生じた売上から、手数料及び経費（制作費の回収を含む）を控除した残額（純利益）を、持分比率に応じて分配する。',
    status: 'issue', 
    conflicts: [
      { actor: 'D社 (配信)', demand: '配信優先回収権（MG回収後の分配）を明記すべき。' },
      { actor: 'E社 (スタジオ)', demand: '制作費超過（オーバーラン）時の補填ルールが曖昧。スタジオ負担を限定すべき。' }
    ],
    pendingProposal: null
  },
  {
    id: 'art6',
    title: '第6条（会計処理）',
    content: '本委員会の会計期間は、毎年4月1日から翌年3月31日までとする。幹事会社は、毎会計期間終了後3ヶ月以内に計算書類を作成し、各当事者に報告する。',
    status: 'unchanged',
    conflicts: [],
    pendingProposal: null
  },
  {
    id: 'art7',
    title: '第7条（監査）',
    content: '各当事者は、必要と認める場合、自己の費用負担において、本委員会の会計帳簿及び関連書類を閲覧または謄写することができる。',
    status: 'unchanged',
    conflicts: [],
    pendingProposal: null
  },
  {
    id: 'art8',
    title: '第8条（権利帰属）',
    content: '本作品の著作権は、各当事者がその持分比率に応じて共有する。ただし、二次的著作物の利用許諾窓口はA社とする。',
    status: 'unchanged',
    conflicts: [],
    pendingProposal: null
  }
];

const INITIAL_LOGS = [
  { 
    id: 1, 
    time: '09:00', 
    actor: 'System', 
    action: '製作委員会契約ドラフトを生成', 
    detail: 'テンプレートに基づき、全8条の初期ドラフトを生成しました。'
  },
  { 
    id: 4, 
    time: '11:00', 
    actor: 'D社, E社', 
    action: '第5条に対して修正要請', 
    detail: 'D社: 配信優先回収権の追加を要望。\nE社: 制作費超過時の責任範囲の明確化を要望。'
  },
];

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const PieChart = () => {
  const gradient = `conic-gradient(
    #ef4444 0% 30%, 
    #3b82f6 30% 50%, 
    #22c55e 50% 65%, 
    #9333ea 65% 75%, 
    #f97316 75% 85%, 
    #cbd5e1 85% 100%
  )`;

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 rounded-full border-4 border-white shadow-sm" style={{ background: gradient }}></div>
      <div className="text-xs space-y-1">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> A社: 30% (1.5億)</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> B社: 20% (1.0億)</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> C社: 15% (0.75億)</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-600 rounded-sm"></div> D社: 10% (0.5億)</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-300 rounded-sm"></div> その他: 25%</div>
      </div>
    </div>
  );
};

const getStatusIcon = (status) => {
  if (status === 'approved') return <CheckCircle size={18} className="text-green-500" fill="#ecfdf5" />;
  if (status === 'rejected') return <X size={18} className="text-red-500" fill="#fef2f2" />;
  return <Clock size={18} className="text-gray-400" />;
};

// -----------------------------------------------------------------------------
// Main App
// -----------------------------------------------------------------------------

export default function AgileContractApp() {
  const [currentUser, setCurrentUser] = useState(STAKEHOLDERS[0]); 
  const [stage, setStage] = useState('review'); 
  const [contractData, setContractData] = useState(INITIAL_CONTRACT);
  const [stakeholders, setStakeholders] = useState(STAKEHOLDERS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  
  const [editingId, setEditingId] = useState(null); 
  const [editText, setEditText] = useState('');
  
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const logsContainerRef = useRef(null);
  const apiKey = ""; 

  // Load/Save Logic
  useEffect(() => {
    const savedData = localStorage.getItem('agileContract_v3_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setContractData(parsed.contractData);
        setStakeholders(parsed.stakeholders);
        setLogs(parsed.logs);
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('agileContract_v3_data', JSON.stringify({ contractData, stakeholders, logs }));
  }, [contractData, stakeholders, logs]);

  // ログ追加（最新を先頭に）
  const addLog = (actor, action, detail) => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLogs(prev => [{ id: Date.now(), time: timeStr, actor, action, detail, isNew: true }, ...prev]);
    
    // アニメーション
    setTimeout(() => {
      setLogs(prev => prev.map(l => ({ ...l, isNew: false })));
    }, 2000);
  };

  // --- Actions ---

  const handleStartEdit = (article) => {
    setEditingId(article.id);
    setEditText(article.content);
    setAiResponse(''); 
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setAiResponse('');
  };

  const handleProposeChange = (id, newContent) => {
    const updatedContract = contractData.map(c => 
      c.id === id ? { 
        ...c, 
        pendingProposal: {
          actorId: currentUser.id,
          actorName: currentUser.name,
          content: newContent,
          timestamp: new Date().toLocaleTimeString()
        }
      } : c
    );
    setContractData(updatedContract);
    setEditingId(null);
    
    addLog(currentUser.name, '修正案を提出', `【${currentUser.name}案】\n${newContent}`);
  };

  const handleApproveProposal = (article) => {
    const updatedContract = contractData.map(c => 
      c.id === article.id ? { 
        ...c, 
        content: article.pendingProposal.content, 
        status: 'resolved', 
        conflicts: [],
        pendingProposal: null 
      } : c
    );
    setContractData(updatedContract);
    setStakeholders(prev => prev.map(s => ({ ...s, status: 'pending' })));
    
    addLog(currentUser.name, '修正案を承認・反映', `第${article.id.replace('art','')}条の${article.pendingProposal.actorName}案を採用しました。本文が更新されました。`);
  };

  const handleRejectProposal = (article) => {
    const updatedContract = contractData.map(c => 
      c.id === article.id ? { ...c, pendingProposal: null } : c
    );
    setContractData(updatedContract);
    addLog(currentUser.name, '修正案を却下', `${article.pendingProposal.actorName}の提案は却下されました。原文を維持します。`);
  };

  const handleUserAction = (action) => {
    const newStatus = stakeholders.map(s => 
      s.id === currentUser.id ? { ...s, status: action } : s
    );
    setStakeholders(newStatus);
    addLog(currentUser.name, action === 'approved' ? '現在の契約書を承認' : '契約書に異議あり(保留)', '');
  };

  // AI Functionality
  const callGemini = async (article) => {
    setIsAiLoading(true);
    setAiResponse('');
    
    const prompt = `
      あなたはプロの契約書作成アシスタントです。
      以下の条文について、複数の関係者から対立意見が出ています。
      全員が納得しやすい「公平な折衷案」の条文を作成してください。
      
      【対象】${article.title}
      【原文】${article.content}
      【対立意見】
      ${article.conflicts.map(c => `・${c.actor}: ${c.demand}`).join('\n')}
      
      出力は「提案する条文」のみを、法的効力のある日本語で出力してください。解説は不要です。
    `;

    try {
      if (apiKey) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          }
        );
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "エラー";
        setAiResponse(text);
      } else {
        await new Promise(r => setTimeout(r, 2000));
        setAiResponse("本作品の利用により生じた売上から、手数料及び経費を控除した残額（純利益）を、持分比率に応じて分配する。ただし、D社の配信許諾料（MG）については、優先回収権を認める。また、制作費が承認予算の110%を超過した場合、超過分は委員会全体で協議処理する。");
      }
    } catch (error) {
      console.error(error);
      setAiResponse("エラーが発生しました");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAi = () => {
    setEditText(aiResponse); 
    setAiResponse(''); 
  };

  const handleFinalize = () => {
    const allApproved = stakeholders.every(s => s.status === 'approved');
    if (!allApproved) {
      alert('まだ承認していない参加者がいます。全員の承認が必要です。');
      return;
    }
    if (currentUser.id !== 's1') return alert('幹事会社（A社）のみ実行可能です');
    
    setStage('final');
    addLog('システム', '契約を確定・締結', '全社の署名が完了し、ブロックチェーンに記録されました。');
  };

  const handleReset = () => {
    if(confirm('データをリセットしますか？')) {
      localStorage.removeItem('agileContract_v3_data');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      
      {/* --- Sticky Header for Login/Role --- */}
      <div className="sticky top-0 z-50 bg-slate-900 text-white shadow-md px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-indigo-400"/>
          <span className="text-sm font-bold hidden md:inline">製作委員会 契約プラットフォーム</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
             <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-sm transition-colors border border-slate-600">
               <User size={14}/>
               <span>ログイン中: {currentUser.name}</span>
               <ChevronDown size={12}/>
             </button>
             <div className="absolute right-0 top-full mt-1 w-64 bg-white text-slate-900 rounded shadow-xl border border-slate-200 hidden group-hover:block animate-fadeIn overflow-hidden">
               <div className="bg-slate-50 p-2 text-xs font-bold text-slate-500 border-b">アカウント切り替え</div>
               {stakeholders.map(s => (
                 <button key={s.id} onClick={() => setCurrentUser(s)} className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${currentUser.id === s.id ? 'text-indigo-600 font-bold' : ''}`}>
                   {s.name}
                 </button>
               ))}
             </div>
          </div>
          <button onClick={handleReset} title="リセット" className="p-1.5 hover:bg-red-900 rounded text-slate-400 hover:text-white transition-colors">
            <RefreshCw size={14}/>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- Left Column: Contract Document --- */}
        <div className="lg:col-span-8">
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-14 z-40">
            <div>
               <h1 className="font-bold text-lg flex items-center gap-2">
                 <FileText className="text-indigo-600"/>
                 プロジェクトX 製作委員会契約書
               </h1>
               <p className="text-xs text-slate-500">最終更新: {logs[0]?.time}</p>
            </div>
            <div className="flex gap-2">
               {stage === 'final' ? (
                 <div className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded flex items-center gap-2">
                   <CheckCircle size={16}/> 締結済み
                 </div>
               ) : (
                 <>
                   <button onClick={() => handleUserAction('rejected')} className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-bold border ${currentUser.status === 'rejected' ? 'bg-red-100 border-red-300 text-red-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-red-50'}`}>
                     <ThumbsDown size={16}/> 異議あり
                   </button>
                   <button onClick={() => handleUserAction('approved')} className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-bold border ${currentUser.status === 'approved' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-green-600 border-green-600 text-white hover:bg-green-700 shadow'}`}>
                     <ThumbsUp size={16}/> 承認する
                   </button>
                 </>
               )}
            </div>
          </div>

          <div className="space-y-4 pb-12">
            {contractData.map((article) => (
              <div 
                key={article.id} 
                className={`bg-white rounded-xl border-2 transition-all duration-300 ${
                  editingId === article.id ? 'border-indigo-500 shadow-lg ring-4 ring-indigo-50' : 
                  article.pendingProposal ? 'border-orange-300 bg-orange-50/30' :
                  article.status === 'issue' ? 'border-red-300 bg-red-50' : 
                  article.status === 'resolved' ? 'border-green-300 bg-green-50' : 'border-slate-200'
                }`}
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-xl">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    {article.status === 'issue' && <ShieldAlert size={18} className="text-red-500"/>}
                    {article.status === 'resolved' && <CheckCircle size={18} className="text-green-500"/>}
                    {article.pendingProposal && <AlertCircle size={18} className="text-orange-500 animate-pulse"/>}
                    {article.title}
                  </div>
                  {stage !== 'final' && editingId !== article.id && !article.pendingProposal && (
                    <button 
                      onClick={() => handleStartEdit(article)}
                      className="text-sm text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded font-bold flex items-center gap-1 transition-colors"
                    >
                      <Edit3 size={14}/> 修正提案を作成
                    </button>
                  )}
                </div>

                <div className="p-5">
                  {editingId === article.id ? (
                    <div className="animate-fadeIn">
                      <div className="bg-indigo-50 p-2 mb-2 rounded text-xs text-indigo-700 flex items-center gap-2 font-bold">
                        <Edit3 size={12}/>
                        {currentUser.name} として修正案を作成中...
                      </div>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full h-48 p-4 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-base leading-relaxed mb-4 bg-white shadow-inner"
                        placeholder="修正案を入力してください..."
                      />
                      
                      {article.conflicts.length > 0 && (
                        <div className="mb-4 bg-white border border-indigo-100 p-3 rounded-lg shadow-sm">
                          <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm mb-2">
                            <Bot size={16}/> AIアシスタント
                          </div>
                          <div className="text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded">
                            {article.conflicts.map((c, idx) => (
                              <div key={idx}>・{c.actor}: {c.demand}</div>
                            ))}
                          </div>
                          
                          {!aiResponse && !isAiLoading && (
                            <button onClick={() => callGemini(article)} className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded text-xs shadow hover:opacity-90 flex items-center justify-center gap-2">
                              <Sparkles size={14}/> 対立意見をまとめて折衷案を作成
                            </button>
                          )}
                          
                          {isAiLoading && <div className="text-center text-xs text-indigo-500 py-2 font-bold animate-pulse">AIが思考中...</div>}
                          
                          {aiResponse && (
                            <div className="bg-indigo-50 p-3 rounded border border-indigo-200 animate-slideUp">
                              <div className="text-xs font-bold text-indigo-600 mb-1">AI提案:</div>
                              <div className="text-sm mb-2 leading-relaxed">{aiResponse}</div>
                              <button onClick={handleApplyAi} className="w-full py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700">
                                この案をエディタに反映
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <button onClick={handleCancelEdit} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded">キャンセル</button>
                        <button onClick={() => handleProposeChange(article.id, editText)} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded shadow hover:bg-indigo-700 flex items-center gap-2">
                          <Save size={16}/> 修正案を提出
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-700 leading-loose whitespace-pre-wrap text-sm md:text-base">
                        {article.content}
                      </p>

                      {article.pendingProposal && (
                        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4 animate-slideUp relative">
                           <div className="absolute -top-3 left-4 bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                             <AlertCircle size={12}/> 修正提案中
                           </div>
                           <div className="text-xs text-slate-500 mb-1 flex justify-between">
                             <span>提案者: <span className="font-bold text-slate-700">{article.pendingProposal.actorName}</span></span>
                             <span>{article.pendingProposal.timestamp}</span>
                           </div>
                           <div className="bg-white p-3 rounded border border-orange-100 text-sm leading-relaxed mb-3">
                             {article.pendingProposal.content}
                           </div>
                           
                           <div className="flex gap-2 justify-end">
                             <button 
                               onClick={() => handleRejectProposal(article)}
                               className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 text-xs font-bold rounded hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                             >
                               却下する
                             </button>
                             <button 
                               onClick={() => handleApproveProposal(article)}
                               className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded shadow hover:bg-orange-600 flex items-center gap-1"
                             >
                               <CheckCircle size={12}/> 承認して反映
                             </button>
                           </div>
                        </div>
                      )}
                      
                      {article.status === 'issue' && !article.pendingProposal && (
                        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-r text-sm">
                          <div className="font-bold text-red-700 mb-1 flex items-center gap-2">
                            <MessageSquare size={14}/> 意見の対立が発生しています
                          </div>
                          <div className="text-slate-600 text-xs pl-1 space-y-1">
                            {article.conflicts.map((c, i) => (
                              <div key={i}>・{c.actor}: 「{c.demand}」</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {stage !== 'final' && (
            <div className="bg-slate-800 text-white p-6 rounded-xl text-center sticky bottom-6 shadow-xl">
              <h3 className="font-bold mb-2">契約の最終確定</h3>
              <p className="text-xs text-slate-400 mb-4">
                {stakeholders.every(s => s.status === 'approved') 
                  ? '全員の承認が完了しました。契約を確定できます。' 
                  : `承認待ち: ${stakeholders.filter(s => s.status !== 'approved').length}社あります。`
                }
              </p>
              {currentUser.id === 's1' ? (
                 <button 
                   onClick={handleFinalize} 
                   disabled={!stakeholders.every(s => s.status === 'approved')}
                   className={`px-8 py-3 rounded-full shadow-lg transition-all transform font-bold ${
                     stakeholders.every(s => s.status === 'approved')
                       ? 'bg-indigo-500 hover:bg-indigo-400 hover:scale-105 text-white cursor-pointer'
                       : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                   }`}
                 >
                   契約書を最終確定する
                 </button>
              ) : (
                <button disabled className="px-6 py-2 bg-slate-700 text-slate-500 rounded-full text-xs cursor-not-allowed">
                  幹事会社（A社）のみ実行可能
                </button>
              )}
            </div>
          )}
        </div>

        {/* --- Right Column: Status & Info --- */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 sticky top-20 z-0">
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Building size={18}/> 参加企業の状況
            </h2>
            <div className="space-y-2 mb-6">
              {stakeholders.map(s => (
                <div key={s.id} className="flex items-center justify-between text-sm p-2 hover:bg-slate-50 rounded cursor-default">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(s.status)}
                    <span className={currentUser.id === s.id ? 'font-bold text-indigo-700' : 'text-slate-600'}>
                      {s.name} {currentUser.id === s.id && '(あなた)'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{s.share}%</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <h3 className="font-bold text-slate-700 mb-3 text-sm">出資比率 (総額5億円)</h3>
              <div className="bg-slate-50 p-4 rounded-lg flex justify-center">
                <PieChart />
              </div>
            </div>
          </div>

          {/* Audit Logs (Restored & Sticky) */}
          <div className="bg-slate-900 text-slate-300 p-5 rounded-xl shadow-lg border border-slate-700 h-[500px] flex flex-col sticky top-[450px]">
            <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
              <h2 className="font-bold text-white flex items-center gap-2 text-sm">
                <History size={16} className="text-green-400"/> システム監査ログ
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-slate-400 font-mono">LIVE MONITORING</span>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar font-mono text-xs" ref={logsContainerRef}>
              {logs.map(log => (
                <div 
                  key={log.id} 
                  className={`border-l-2 pl-3 transition-all duration-500 ${
                    log.isNew 
                      ? 'border-green-400 bg-green-900/20 p-2 rounded-r' 
                      : 'border-slate-600 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex justify-between text-slate-500 mb-1 text-[10px]">
                    <span>{log.time}</span>
                    <span className="font-bold text-indigo-300">@{log.actor}</span>
                  </div>
                  <div className="text-slate-200 font-bold mb-1">{log.action}</div>
                  {log.detail && (
                    <div className="text-slate-400 text-[10px] leading-relaxed whitespace-pre-wrap bg-slate-800/50 p-2 rounded mt-1">
                      {log.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Preview Button (Floating) */}
      <button 
        onClick={() => setShowPreview(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold z-50 transition-transform hover:scale-105"
      >
        <Eye size={20}/>
        <span className="hidden md:inline">完成プレビュー</span>
      </button>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-scaleIn">
            <div className="bg-slate-100 p-4 border-b flex justify-between items-center">
               <h2 className="font-bold text-slate-700 flex items-center gap-2">
                 <FileText size={18}/> 契約書プレビュー
               </h2>
               <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20}/></button>
            </div>
            <div className="flex-grow overflow-y-auto p-8 md:p-16 bg-white text-slate-800 font-serif leading-loose">
              <h1 className="text-2xl md:text-3xl font-bold text-center mb-12 pb-4 border-b-2 border-black inline-block w-full">製作委員会契約書</h1>
              {contractData.map(art => (
                <div key={art.id} className="mb-8">
                  <h3 className="font-bold mb-2 text-lg">{art.title}</h3>
                  <p className="text-justify whitespace-pre-wrap">{art.content}</p>
                </div>
              ))}
              <div className="mt-16 pt-8 border-t border-slate-300">
                <p className="mb-8">以上を証するため、本契約書を作成し、全当事者が電子署名を行う。</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {stakeholders.map(s => (
                    <div key={s.id} className="border-b border-slate-300 pb-2">
                      <div className="text-xs text-slate-500 mb-1">{s.role}</div>
                      <div className="flex justify-between items-end">
                        <span className="font-bold">{s.name}</span>
                        <span className="text-xs font-mono text-slate-400">
                          {stage === 'final' ? `Signed: ${new Date().toLocaleDateString()}` : '(未署名)'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}