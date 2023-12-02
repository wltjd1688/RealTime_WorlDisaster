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
  // Add other necessary fields here
}

const DidArticle: React.FC<ArticleProps> = ({ dID }) => {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        // Directly destructure data from the response
        const response = await axios(`https://worldisaster.com/api/live/${dID}`);
        setArticle(response.data);
        console.log("기사 데이터 받음",response.data);
      } catch (err) {
        // Handle axios errors
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

  if (!article) {
    return <div>No article found</div>;
  }

  return (
    <div>
      {article.forEach((index) => {
        
      })}
    </div>
  );
};

export default DidArticle;
