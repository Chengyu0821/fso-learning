const dummy = (blogs) => {
    return 1
  }
  

const totalLikes = (blogs) => {
  return blogs.reduce((acc, blog) => acc + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  return blogs.reduce((fav, blog) =>
    blog.likes > fav.likes ? blog : fav
  )
}


const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  // --------------------------------------------------------
  // Step 1：统计每个作者写了多少篇博客（使用 reduce）
  // --------------------------------------------------------
  //
  // blogs.reduce(
  //   (acc, blog) => {...},
  //   {}
  // )
  //
  // acc（accumulator）形状如下：
  //
  // 初始值: {}
  // 遍历后: {
  //   "Robert C. Martin": 3,
  //   "Edsger W. Dijkstra": 2,
  //   "Michael Chan": 1
  // }
  //
  const authorCount = blogs.reduce((acc, blog)=> {
    // 对于 blog.author：
    // 如果 acc 里没有这个作者 → 用 0 初始化
    // 然后 +1（这篇文章计入他的数量）
    acc[blog.author] = (acc[blog.author] || 0) + 1
    return acc // 返回累积对象，供下一次 reduce 使用
  }, {})

  // --------------------------------------------------------
  // Step 2：Object.entries(authorCount)
  //   → 把 { author: count } 转成可遍历的数组
  // --------------------------------------------------------
  //
  // Object.entries(authorCount) 会变成：
  //
  // [
  //   ["Robert C. Martin", 3],
  //   ["Edsger W. Dijkstra", 2],
  //   ["Michael Chan", 1]
  // ]
  //
  // 这样每一项是 [authorName, blogCount]
  // 易于用 reduce 找“最多博客的作者”
  //
  const [topAuthor, blogCount] = Object.entries(authorCount)
    .reduce((max, cur) => (cur[1] > max[1] ? cur : max))
    // ----------------------------------------------------
    // Step 3：用 reduce 找最大值
    // ----------------------------------------------------
    //
    // max = 当前认为最大的 ["作者名", 数量]
    // cur = 当前遍历到的 ["作者名", 数量]
    //
    // cur[1] 是数量
    // max[1] 是当前最大数量
    //
    // 如果 cur 的数量更大 → 替换 max
    //

  return {
    author: topAuthor,
    blogs: blogCount
  } 
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const authorCount = blogs.reduce((acc, blog)=> {
    acc[blog.author] = (acc[blog.author] || 0) + blog.likes
    return acc
  }, {})

  const [topAuthor, likesCount] = Object.entries(authorCount)
    .reduce((max, cur) => (cur[1] > max[1] ? cur : max))

  return {
    author: topAuthor,
    likes: likesCount
  } 
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}