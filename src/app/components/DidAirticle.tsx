import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ArticleProps {
  dID: string;
}

interface ArticleData {
  headline: string;
  author: string;
  url: string;
  image: string;
  // Add other necessary fields here
}

const DidArticle: React.FC<ArticleProps> = ({ dID }) => {
  const [articles, setArticles] = useState<ArticleData[]>([]); // 배열로 초기화
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        const response = await axios(`https://worldisaster.com/api/live/${dID}`);
        setArticles(response.data); // 배열로 설정
        console.log("기사 데이터 받음");
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [dID]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (articles.length === 0) {
    return <div>No articles found</div>;
  }

  return (
    <div>
      {articles.map((article, index) => (
        <div key={index} className=" py-3">
            <div className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden">
                <img className=" w-full object-cover object-center" src={article.image? article.image:"https://via.placeholder.com/150x100.png?text=NO IMAGE"} alt="article" />
                <div className="p-6">
                    <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">{article.headline}</h2>
                    <div className="flex items-center flex-wrap">
                        <Link target='_blank' href={article.url} className="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0">Learn More
                          <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14"></path>
                              <path d="M12 5l7 7-7 7"></path>
                          </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      ))}
    </div>
  );
};

export default DidArticle;
