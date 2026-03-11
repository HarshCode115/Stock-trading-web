import { toast } from 'react-toastify';

const useToast = () => {
  const showToast = {
    success: (message, options = {}) => {
      if (message && typeof message === 'string') {
        toast.success(message, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          ...options,
        });
      }
    },

    error: (message, options = {}) => {
      if (message && typeof message === 'string') {
        toast.error(message, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          ...options,
        });
      }
    },

    warning: (message, options = {}) => {
      if (message && typeof message === 'string') {
        toast.warning(message, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          ...options,
        });
      }
    },

    info: (message, options = {}) => {
      if (message && typeof message === 'string') {
        toast.info(message, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          ...options,
        });
      }
    },

    // Custom toast for transactions
    transaction: {
      success: (type, stockSymbol, amount) => {
        if (type && stockSymbol && amount) {
          const message = `${type.charAt(0).toUpperCase() + type.slice(1)} order executed successfully!`;
          const details = `${stockSymbol} - $${amount.toLocaleString()}`;
          
          toast.success(
            <div>
              <div className="font-semibold">{message}</div>
              <div className="text-sm opacity-90">{details}</div>
            </div>,
            {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        }
      },

      error: (message) => {
        if (message && typeof message === 'string') {
          toast.error(message, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      },
    },

    // Custom toast for watchlist
    watchlist: {
      added: (stockSymbol) => {
        if (stockSymbol && typeof stockSymbol === 'string') {
          toast.success(
            <div>
              <div className="font-semibold">Added to Watchlist</div>
              <div className="text-sm opacity-90">{stockSymbol}</div>
            </div>,
            {
              position: 'top-right',
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        }
      },

      removed: (stockSymbol) => {
        if (stockSymbol && typeof stockSymbol === 'string') {
          toast.info(
            <div>
              <div className="font-semibold">Removed from Watchlist</div>
              <div className="text-sm opacity-90">{stockSymbol}</div>
            </div>,
            {
              position: 'top-right',
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        }
      },
    },

    // Custom toast for alerts
    alert: {
      triggered: (stockSymbol, alertType, alertPrice, currentPrice) => {
        toast.warning(
          <div>
            <div className="font-semibold">Price Alert Triggered!</div>
            <div className="text-sm opacity-90">
              {stockSymbol} is {alertType} ${alertPrice} (Current: ${currentPrice})
            </div>
          </div>,
          {
            position: 'top-right',
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      },
    },
  };

  return showToast;
};

export default useToast;
