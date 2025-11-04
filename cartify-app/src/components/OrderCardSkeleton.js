import React from 'react';
import './Skeleton.css';

const OrderCardSkeleton = () => (
  <div className="card mb-4 order-card skeleton">
    <div className="card-body">
      {/* Order Header Skeleton */}
      <div className="row align-items-center mb-3">
        <div className="col-md-6">
          <div className="d-flex align-items-center gap-3 mb-2">
            <div className="skeleton-line title"></div>
            <div className="skeleton-badge"></div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="skeleton-icon small"></div>
            <div className="skeleton-line short"></div>
          </div>
        </div>
        <div className="col-md-6 text-md-end">
          <div className="skeleton-line price mb-1"></div>
          <div className="skeleton-line xshort"></div>
        </div>
      </div>

      {/* Progress Bar Skeleton */}
      <div className="mb-4">
        <div className="progress skeleton-progress">
          <div className="progress-bar"></div>
        </div>
        <div className="d-flex justify-content-between small mt-1">
          <div className="skeleton-line xshort"></div>
          <div className="skeleton-line xshort"></div>
          <div className="skeleton-line xshort"></div>
        </div>
      </div>

      {/* Order Items Skeleton */}
      <div className="mb-4 order-items-container">
        <div className="row align-items-center order-item">
          <div className="col-md-1">
            <div className="skeleton-image"></div>
          </div>
          <div className="col-md-5">
            <div className="skeleton-line mb-1"></div>
            <div className="skeleton-line xshort"></div>
            <div className="skeleton-rating mt-1"></div>
          </div>
          <div className="col-md-2">
            <div className="skeleton-line short"></div>
          </div>
          <div className="col-md-4 text-end">
            <div className="skeleton-button"></div>
          </div>
        </div>
      </div>

      {/* Order Details Skeleton */}
      <div className="row text-sm mb-3">
        <div className="col-md-6">
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="skeleton-icon"></div>
            <div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="skeleton-icon"></div>
            <div>
              <div className="skeleton-line medium"></div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="skeleton-icon"></div>
            <div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        </div>
        <div className="col-md-6 text-md-end">
          <div className="mb-2">
            <div className="skeleton-line short"></div>
          </div>
          <div className="mb-2">
            <div className="skeleton-line short"></div>
          </div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex gap-2 flex-wrap">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="skeleton-button action"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default OrderCardSkeleton;