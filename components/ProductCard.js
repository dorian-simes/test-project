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
    e.target.closest(`.${styles.imageContainer}`).classList.add(styles.imageFailed);
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
            tabIndex={-1}
          >
            <img
              src={image_url}
              alt={title || 'Watch product'}
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

        {/* Competitor badge - top left */}
        {website && (
          <span className={styles.competitorBadge}>{website}</span>
        )}

        {/* Category badge - top right */}
        {category && (
          <span className={styles.categoryBadge}>{category}</span>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title || 'Untitled Product'}</h3>

        {description && <p className={styles.description}>{description}</p>}

        {price && (
          <p className={styles.price}>{price}</p>
        )}

        <div className={styles.meta}>
          <span className={styles.metaItem}>{website}</span>
          {date_added && (
            <>
              <span className={styles.metaDivider}>·</span>
              <span className={styles.metaItem}>{date_added}</span>
            </>
          )}
          {product_url && (
            <a
              href={product_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.viewLink}
            >
              View →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
