const supabase = window.supabase.createClient(
  'https://iztnjftbodpolnnrsbmr.supabase.co', // ← Supabase 프로젝트 URL로 변경
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dG5qZnRib2Rwb2xubnJzYm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4OTc3NTEsImV4cCI6MjA2ODQ3Mzc1MX0.8JsxpwUci4vg_wCrY89gKeFXPO_8NTBmhfWXitGMfPM' // ← Supabase public anon key로 변경
);

// 게시글 로딩
async function fetchArticles(category = '', keyword = '', sort = 'newest') {
  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' });

  if (category) {
    query = query.eq('category', category);
  }

  if (keyword) {
    query = query.or(
      `title.ilike.%${keyword}%,content.ilike.%${keyword}%,author.ilike.%${keyword}%`
    );
  }

  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else if (sort === 'title') {
    query = query.order('title', { ascending: true });
  } else if (sort === 'author') {
    query = query.order('author', { ascending: true });
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('📛 게시글 불러오기 오류:', error.message);
    return;
  }

  renderArticles(data);
  updateStats(data);
  document.getElementById('resultInfo').textContent = `총 ${count}건의 게시글`;
  document.getElementById('totalCount').textContent = count;
}

// 게시글 렌더링
function renderArticles(articles) {
  const tbody = document.getElementById('articleTableBody');
  tbody.innerHTML = '';

  if (!articles.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">📭 게시글이 없습니다.</td></tr>';
    return;
  }

  articles.forEach((article) => {
    const row = document.createElement('tr');
    row.className = 'article-row';
    row.innerHTML = `
      <td class="article-id">${article.id}</td>
      <td class="article-category"><span class="category-badge">${article.category}</span></td>
      <td>
        <div class="article-title">${article.title}</div>
        <div class="article-preview">${article.content}</div>
      </td>
      <td class="article-author">${article.author}</td>
      <td class="article-date">${new Date(article.created_at).toLocaleDateString()}</td>
    `;
    row.onclick = () => openModal(article);
    tbody.appendChild(row);
  });
}

// 통계 업데이트
function updateStats(data) {
  const uniqueAuthors = new Set(data.map(a => a.author));
  const uniqueCategories = new Set(data.map(a => a.category));

  document.getElementById('totalAuthors').textContent = uniqueAuthors.size;
  document.getElementById('totalCategories').textContent = uniqueCategories.size;
}

// 모달 열기
function openModal(article) {
  const modal = document.getElementById('articleModal');
  modal.querySelector('.modal-title').textContent = article.title;
  modal.querySelector('.modal-meta').innerHTML = `
    <div>작성자: ${article.author}</div>
    <div>작성일: ${new Date(article.created_at).toLocaleDateString()}</div>
  `;
  modal.querySelector('.article-content').textContent = article.content;
  modal.style.display = 'block';
}

// 모달 닫기
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('close-btn') || e.target.id === 'articleModal') {
    document.getElementById('articleModal').style.display = 'none';
  }
});

// 검색 이벤트
document.getElementById('searchInput').addEventListener('input', () => {
  const keyword = document.getElementById('searchInput').value.trim();
  document.getElementById('clearSearch').style.display = keyword ? 'inline' : 'none';
  fetchArticles('', keyword, document.getElementById('sortSelect').value);
});

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('clearSearch').style.display = 'none';
  fetchArticles();
}

// 정렬 이벤트
document.getElementById('sortSelect').addEventListener('change', () => {
  const keyword = document.getElementById('searchInput').value.trim();
  fetchArticles('', keyword, document.getElementById('sortSelect').value);
});

// 카테고리 클릭 시
document.getElementById('categoryNav').addEventListener('click', (e) => {
  if (e.target.closest('.category-link')) {
    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(link => link.classList.remove('active'));
    const clickedLink = e.target.closest('.category-link');
    clickedLink.classList.add('active');

    const selectedCategory = clickedLink.dataset.category;
    const keyword = document.getElementById('searchInput').value.trim();
    fetchArticles(selectedCategory, keyword, document.getElementById('sortSelect').value);

    document.getElementById('boardTitle').textContent = clickedLink.textContent.trim();
    document.getElementById('boardSubtitle').textContent = selectedCategory
      ? `카테고리 "${selectedCategory}"의 자료를 확인할 수 있습니다.`
      : '모든 연구 자료를 확인할 수 있습니다.';
  }
});

// 시작 시 자동 호출
document.addEventListener('DOMContentLoaded', () => {
  fetchArticles();
});
</script>
