'use client';

import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const {
    title = product.raw_title,
    price,
    image_url,
    product_url = product.raw_url,
    website = product.site_name,
    category,
    description,
    date_added
  } = product;

  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {image_url ? (
          <a
            href={product_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.imageLink}
          >
            <img
              src={image_url}
              alt={title || 'Product'}
              onError={handleImageError}
              className={styles.image}
              loading="lazy"
            />
          </a>
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>⌚</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title || 'Untitled Product'}</h3>
          {category && <span className={styles.category}>{category}</span>}
        </div>

        {description && <p className={styles.description}>{description}</p>}

        <div className={styles.details}>
          {price && <p className={styles.price}>{price}</p>}
          <p className={styles.website}>From: {website}</p>
          {date_added && <p className={styles.dateAdded}>Added: {date_added}</p>}
        </div>

        {product_url && (
          <a
            href={product_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.viewLink}
          >
            View on Site →
          </a>
        )}
      </div>
    </div>
  );
}
