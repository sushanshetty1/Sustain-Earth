const NewsCard = ({ article, formatDate }) => {
    return (
        <article className="news-card bg-white rounded-lg overflow-hidden shadow-lg fade-in">
            <img
                src={
                    article.image ||
                    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500'
                }
                alt={article.title}
                className="w-full h-48 object-cover"
                onError={(e) =>
                    (e.target.src =
                        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500')
                }
            />
            <div className="p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                    {article.title}
                </h3>
                <p className="text-gray-600 mb-4">{article.description}</p>
                <div className="flex items-center justify-between text-gray-500">
                    <span className="flex items-center">
                        <i className="bi bi-calendar3 me-2"></i>
                        {formatDate(article.publishedAt)}
                    </span>
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-900 hover:text-blue-700 flex items-center"
                    >
                        Read More <i className="bi bi-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>
        </article>
    );
};

export default NewsCard;
