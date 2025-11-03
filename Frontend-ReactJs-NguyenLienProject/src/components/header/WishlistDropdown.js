import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { FaTimes, FaHeart } from 'react-icons/fa';
import { getUserWishlist, removeFromWishlist } from '../../services/wishlistService';
import { setWishlist, removeWishlistItem, setWishlistLoading, setWishlistError } from '../../store/reducers/wishlistReducer';
import { toast } from 'react-toastify';
import CustomToast from '../CustomToast';
import './WishlistDropdown.scss';

const WishlistDropdown = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);
    const { wishlist, loading } = useSelector((state) => state.wishlist);
    const isLoggedIn = useSelector((state) => state.admin.isLoggedIn);

    const loadWishlist = useCallback(async () => {
        dispatch(setWishlistLoading(true));
        const result = await getUserWishlist();
        if (result.errCode === 0) {
            dispatch(setWishlist({ wishlist: result.wishlist, count: result.total }));
        } else {
            dispatch(setWishlistError(result.errMessage));
        }
    }, [dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            if (isLoggedIn) {
                loadWishlist();
            }
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, isLoggedIn, loadWishlist, onClose]);

    const handleRemoveItem = async (wishlistId, e) => {
        e.stopPropagation();
        const result = await removeFromWishlist(wishlistId);
        if (result.errCode === 0) {
            dispatch(removeWishlistItem(wishlistId));
            toast(
                (props) => (
                    <CustomToast
                        {...props}
                        type="success"
                        titleId="wishlist.removed"
                        messageId="wishlist.removed_message"
                        time={new Date()}
                    />
                ),
                { closeButton: false, type: "success" }
            );
        } else {
            toast(
                (props) => (
                    <CustomToast
                        {...props}
                        type="error"
                        titleId="wishlist.error"
                        message={result.errMessage}
                        time={new Date()}
                    />
                ),
                { closeButton: false, type: "error" }
            );
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
        onClose();
    };

    const getProductImage = (product) => {
        if (product?.product?.images && product.product.images.length > 0) {
            return `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'}/uploads/${product.product.images[0].imageUrl}`;
        }
        return '/placeholder-product.png';
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (!isOpen) return null;

    return (
        <div className="wishlist-dropdown" ref={dropdownRef}>
            <div className="wishlist-dropdown-header">
                <h3>
                    <FormattedMessage id="wishlist.title" defaultMessage="Danh sách yêu thích" />
                </h3>
                <button className="close-btn" onClick={onClose}>
                    <FaTimes />
                </button>
            </div>

            <div className="wishlist-dropdown-content">
                {!isLoggedIn ? (
                    <div className="wishlist-empty">
                        <FaHeart className="empty-icon" />
                        <p>
                            <FormattedMessage
                                id="wishlist.login_required"
                                defaultMessage="Vui lòng đăng nhập để xem danh sách yêu thích"
                            />
                        </p>
                    </div>
                ) : loading ? (
                    <div className="wishlist-loading">
                        <FormattedMessage id="wishlist.loading" defaultMessage="Đang tải..." />
                    </div>
                ) : wishlist.length === 0 ? (
                    <div className="wishlist-empty">
                        <FaHeart className="empty-icon" />
                        <p>
                            <FormattedMessage
                                id="wishlist.empty"
                                defaultMessage="Danh sách yêu thích trống"
                            />
                        </p>
                    </div>
                ) : (
                    <div className="wishlist-items">
                        {wishlist.map((item) => (
                            <div
                                key={item.id}
                                className="wishlist-item"
                                onClick={() => handleProductClick(item.productId)}
                            >
                                <div className="wishlist-item-image">
                                    <img
                                        src={getProductImage(item)}
                                        alt={item.product?.nameProduct || 'Product'}
                                        onError={(e) => {
                                            e.target.src = '/placeholder-product.png';
                                        }}
                                    />
                                </div>
                                <div className="wishlist-item-info">
                                    <h4 className="wishlist-item-name">
                                        {item.product?.nameProduct || 'Sản phẩm'}
                                    </h4>
                                    <div className="wishlist-item-price">
                                        {item.product?.discountPrice ? (
                                            <>
                                                <span className="discount-price">
                                                    {formatPrice(item.product.discountPrice)}
                                                </span>
                                                <span className="original-price">
                                                    {formatPrice(item.product.price)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="price">
                                                {formatPrice(item.product?.price || 0)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="wishlist-item-remove"
                                    onClick={(e) => handleRemoveItem(item.id, e)}
                                    title="Xóa khỏi danh sách yêu thích"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isLoggedIn && wishlist.length > 0 && (
                <div className="wishlist-dropdown-footer">
                    <button
                        className="view-all-btn"
                        onClick={() => {
                            navigate('/wishlist');
                            onClose();
                        }}
                    >
                        <FormattedMessage id="wishlist.view_all" defaultMessage="Xem tất cả" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default WishlistDropdown;

