import React, { Component } from 'react'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import PostForm from './PostForm';
import Spinner from '../common/Spinner';
import { getPosts } from '../../actions/postAction';
import PostFeed from './PostFeed';

class Post extends Component {

  componentDidMount() {
    this.props.getPosts();
  }

  render() {

    const { posts, loading } = this.props.post;
    let postContent;

    if (posts == null || loading) {
      postContent = <Spinner />
    } else {
      postContent = <PostFeed post={posts} />
    }

    return (
      <div className="feed">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <PostForm />
              {postContent}
            </div>
          </div>
        </div>

      </div>
    )
  }
}

Post.propTypes = {
  post: PropTypes.object.isRequired,
  getPosts: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  post: state.post
})

export default connect(mapStateToProps, { getPosts })(Post);