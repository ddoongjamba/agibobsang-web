import React, { useState, useEffect } from 'react';
import { Download, Star, ChefHat, Calendar, Baby, X, Menu, ChevronRight, CheckCircle, MessageCircle, Send, User } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";

// ------------------------------------------------------------------
// [중요] 1단계에서 복사한 'firebaseConfig' 내용을 아래 괄호 안에 붙여넣으세요!
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCdmUliUBDtAA8pWNRdHmqmDPMngHfbV88",
  authDomain: "agibobsang-web.firebaseapp.com",
  projectId: "agibobsang-web",
  storageBucket: "agibobsang-web.firebasestorage.app",
  messagingSenderId: "390549082726",
  appId: "1:390549082726:web:93e0b7ba76ab15125bd3a7"
};

// 앱 초기화 (Config가 비어있지 않을 때만 실행)
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

const AppLandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [posts, setPosts] = useState([]);
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) setIsScrolled(true);
      else setIsScrolled(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Firebase 인증 및 데이터 로드
  useEffect(() => {
    if (!auth) return;

    signInAnonymously(auth).catch((error) => console.error("Auth Error:", error));

    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  // 게시글 실시간 동기화
  useEffect(() => {
    if (!db) return;

    // 내 프로젝트이므로 경로를 단순하게 'board_posts'로 사용합니다.
    // (주의: Firestore에서 컬렉션 ID를 'board_posts'로 자동 생성합니다)
    const postsRef = collection(db, 'board_posts');

    // 쿼리: 시간순 정렬 (JS에서 처리하거나 인덱스 생성 후 orderBy 사용)
    // 여기서는 간단하게 데이터를 가져온 후 클라이언트에서 정렬합니다.
    const q = query(postsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // 최신순 정렬
      loadedPosts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setPosts(loadedPosts);
    });

    return () => unsubscribe();
  }, [db]);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!content.trim() || !nickname.trim()) {
      alert("닉네임과 내용을 모두 입력해주세요!");
      return;
    }
    if (!db) {
      alert("Firebase 설정이 완료되지 않았습니다. 코드를 확인해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'board_posts'), {
        nickname: nickname,
        content: content,
        createdAt: serverTimestamp(),
        uid: user ? user.uid : 'anonymous'
      });
      setContent('');
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("글 작성 실패! (Firestore 규칙을 확인하세요)");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const openPlayStore = () => {
    window.open('https://play.google.com/store/apps/details?id=com.bcabove.agibobsang', '_blank');
  };

  return (
    <div className="font-sans text-gray-800 bg-orange-50/30 min-h-screen flex flex-col">
      {/* 네비게이션 바 */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-orange-400 text-white p-1.5 rounded-lg">
              <ChefHat size={24} />
            </div>
            <span className="text-xl font-bold text-orange-900 tracking-tight">아기밥상</span>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
            <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-orange-500 transition font-medium">주요 기능</button>
            <button onClick={() => scrollToSection('board')} className="text-gray-600 hover:text-orange-500 transition font-medium flex items-center gap-1"><MessageCircle size={18} /> 육아톡톡</button>
            <button onClick={() => scrollToSection('reviews')} className="text-gray-600 hover:text-orange-500 transition font-medium">생생 후기</button>
            <button onClick={openPlayStore} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-bold transition shadow-lg flex items-center gap-2">
              앱 다운로드 <Download size={16} />
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600">
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-lg border-t border-gray-100 flex flex-col p-4 space-y-4">
            <button onClick={() => scrollToSection('features')} className="text-left text-gray-600 font-medium py-2">주요 기능</button>
            <button onClick={() => scrollToSection('board')} className="text-left text-gray-600 font-medium py-2">육아톡톡 (게시판)</button>
            <button onClick={() => scrollToSection('reviews')} className="text-left text-gray-600 font-medium py-2">생생 후기</button>
            <button onClick={openPlayStore} className="bg-orange-500 text-white py-3 rounded-lg font-bold text-center">앱 다운로드하기</button>
          </div>
        )}
      </nav>

      {/* 히어로 섹션 */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 z-10 text-center md:text-left">
            <div className="inline-block bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6 animate-fade-in-up">
              🎉 초보 엄마아빠 필수 앱 1위
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              오늘 우리 아이 <br />
              <span className="text-orange-500">뭐 먹일지</span> 고민 끝!
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              냉장고 속 재료만 입력하세요.<br className="md:hidden" /> 영양 만점 식단과 레시피를 <br className="hidden md:block" />
              <strong>아기밥상</strong>이 1초 만에 추천해 드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={openPlayStore}
                className="flex items-center justify-center gap-3 bg-black text-white px-6 py-3.5 rounded-xl hover:bg-gray-800 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-8" />
              </button>
              <button
                onClick={() => alert("iOS 버전은 준비 중입니다!")}
                className="flex items-center justify-center gap-3 bg-gray-200 text-gray-500 px-6 py-3.5 rounded-xl cursor-not-allowed"
              >
                <span className="font-bold">App Store</span> (준비중)
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              * 현재 안드로이드(Android) 버전 지원 중
            </p>
          </div>

          <div className="md:w-1/2 z-10 relative">
            <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col overflow-hidden">
              <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
              <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
              <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative">
                <div className="bg-orange-500 h-16 flex items-end pb-3 px-4">
                  <span className="text-white font-bold text-lg">아기밥상</span>
                </div>
                <div className="p-4">
                  <div className="bg-orange-50 p-4 rounded-xl mb-4">
                    <span className="text-xs text-orange-600 font-bold">오늘의 추천</span>
                    <h3 className="font-bold text-lg text-gray-800">소고기 미역 죽 🥣</h3>
                    <p className="text-xs text-gray-500 mt-1">철분 가득! 8개월 아기에게 딱이에요.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <Calendar className="mx-auto text-green-600 w-6 h-6 mb-1" />
                      <span className="text-xs font-bold text-gray-700">식단표</span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <Baby className="mx-auto text-blue-600 w-6 h-6 mb-1" />
                      <span className="text-xs font-bold text-gray-700">성장기록</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-20 bg-gray-100 rounded-lg flex items-center p-3 gap-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="w-2/3 h-3 bg-gray-300 rounded mb-2"></div>
                        <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-20 bg-gray-100 rounded-lg flex items-center p-3 gap-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="w-2/3 h-3 bg-gray-300 rounded mb-2"></div>
                        <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 w-full h-16 bg-white border-t flex justify-around items-center text-gray-400">
                  <div className="text-orange-500 flex flex-col items-center"><ChefHat size={20} /><span className="text-[10px]">홈</span></div>
                  <div className="flex flex-col items-center"><Calendar size={20} /><span className="text-[10px]">식단</span></div>
                  <div className="flex flex-col items-center"><Baby size={20} /><span className="text-[10px]">마이</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 기능 소개 섹션 */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-orange-500 font-bold tracking-wide uppercase mb-3">Special Features</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">육아가 쉬워지는 마법같은 기능</h3>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              아기밥상 앱 하나면 이유식 공부, 재료 관리, 식단 짜기 스트레스에서 해방됩니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <ChefHat className="w-10 h-10 text-orange-500" />,
                title: "냉장고 파먹기 레시피",
                desc: "냉장고에 남은 재료를 입력해보세요. 지금 당장 만들 수 있는 최적의 이유식 레시피를 찾아드립니다."
              },
              {
                icon: <Calendar className="w-10 h-10 text-green-500" />,
                title: "월령별 맞춤 식단표",
                desc: "초기, 중기, 후기, 완료기까지. 전문가가 감수한 시기별 영양 식단을 캘린더에 자동으로 채워드려요."
              },
              {
                icon: <Baby className="w-10 h-10 text-blue-500" />,
                title: "우리 아이 성장 기록",
                desc: "잘 먹고 잘 크고 있을까? 키, 몸무게를 기록하고 또래 아이들과 성장 발달을 비교해 보세요."
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition duration-300 border border-gray-100">
                <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center shadow-sm mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✨ 육아 톡톡 게시판 섹션 */}
      <section id="board" className="py-20 bg-yellow-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="inline-block bg-yellow-200 text-yellow-800 px-4 py-1 rounded-full text-sm font-bold mb-4">
              Community
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">육아 톡톡 (Talk Talk)</h3>
            <p className="mt-3 text-gray-600">
              앱에 바라는 점이나 육아 꿀팁을 자유롭게 남겨주세요! (실시간 저장됨)
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* 왼쪽: 글쓰기 폼 */}
            <div className="lg:w-1/3">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-yellow-100 sticky top-24">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageCircle className="text-orange-500" /> 글 남기기
                </h4>
                <form onSubmit={handleSubmitPost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">닉네임</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="예: 튼튼맘"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">내용</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="이유식 시작하려니 막막하네요~ 다들 화이팅입니다!"
                      rows="4"
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-gray-50 resize-none"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition shadow-md
                            ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 hover:-translate-y-0.5'}
                        `}
                  >
                    <Send size={18} /> {isSubmitting ? '등록 중...' : '등록하기'}
                  </button>
                </form>
              </div>
            </div>

            {/* 오른쪽: 게시글 목록 */}
            <div className="lg:w-2/3">
              <div className="grid gap-4 sm:grid-cols-2">
                {posts.length === 0 ? (
                  <div className="col-span-2 text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                    아직 등록된 글이 없습니다. 첫 번째 글을 남겨보세요! 📝<br />
                    (글이 안 보인다면 Firebase 설정이 되었는지 확인해주세요)
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold text-xs">
                            {post.nickname ? post.nickname[0] : '?'}
                          </div>
                          <span className="font-bold text-gray-800 text-sm">{post.nickname}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : '방금 전'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap flex-grow">
                        {post.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 통계/신뢰 섹션 */}
      <section className="py-16 bg-orange-500 text-white">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-extrabold mb-2">50K+</div>
            <div className="text-orange-100">누적 다운로드</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-extrabold mb-2">4.8</div>
            <div className="text-orange-100">사용자 평점</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-extrabold mb-2">1,000+</div>
            <div className="text-orange-100">보유 레시피</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-extrabold mb-2">1위</div>
            <div className="text-orange-100">육아 카테고리 (추천)</div>
          </div>
        </div>
      </section>

      {/* 후기 섹션 */}
      <section id="reviews" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900">이미 많은 엄마 아빠가 쓰고 있어요</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { user: "지호맘 (8개월)", text: "매일 뭐 먹일지 고민하느라 머리 아팠는데, 이 앱 쓰고 광명 찾았어요! 냉장고 재료 추천 기능이 진짜 대박입니다.", star: 5 },
              { user: "둥이파파 (12개월)", text: "아빠가 이유식 만들기에도 너무 쉽게 설명되어 있어요. 와이프한테 칭찬받았습니다 ㅎㅎ", star: 5 },
              { user: "서윤엄마 (6개월)", text: "초기 이유식 시작하면서 막막했는데 식단표를 짜주니까 그대로만 하면 돼서 너무 편해요. 강추!", star: 5 },
            ].map((review, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(review.star)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                    {review.user[0]}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{review.user}</span>
                  <CheckCircle size={14} className="text-blue-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 다운로드 유도 (CTA) */}
      <section id="download" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-orange-50 border border-orange-100 rounded-3xl p-8 md:p-16 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                지금 바로 <span className="text-orange-500">아기밥상</span>을 시작하세요
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                우리 아이를 위한 건강한 식탁, 더 이상 미루지 마세요.<br />
                지금 다운로드하면 <strong>프리미엄 식단표 1개월 무료!</strong> (기간 한정)
              </p>
              <button
                onClick={openPlayStore}
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold px-10 py-4 rounded-full shadow-xl transition transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                구글 플레이스토어에서 다운로드 <ChevronRight />
              </button>
            </div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-200 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-200 rounded-full opacity-50 blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-white font-bold text-xl">
              <ChefHat /> 아기밥상
            </div>
            <p className="text-sm">이메일: yahjbc@gmail.com</p>
            <p className="text-xs mt-4 text-gray-500">© 2024 BabyFood App. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">이용약관</a>
            <a href="#" className="hover:text-white transition">개인정보처리방침</a>
            <a href="#" className="hover:text-white transition">문의하기</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLandingPage;