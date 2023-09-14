import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
function Home() {

  const [posts, setPosts] = useState([])
  useEffect(() => {
    axios.get('http://localhost:4001/getposts')
      .then(posts => {
        setPosts(posts.data)
      })
      .catch(err => console.log(err))

  }, [])

  return (


    <div className='posts_container'>
      {
        posts.map(post => (
          <Link to={`/post/${post._id}`} className='post'>

            <img src={`http://localhost:4001/Images/${post.file}`} alt="" />

            <div className='post_text'>
              <div className='.post_text home'>
                <h2>{post.title}</h2>
              </div>
              <div className='post_textp1'>
                <p>{post.description}</p>
              </div>
            </div>

          </Link>
        ))
      }
    </div>
  )
}

export default Home

