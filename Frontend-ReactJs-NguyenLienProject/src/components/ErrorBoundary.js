import React from 'react';

class ErrorBoundary extends React.Component {
   state = { hasError: false };

   static getDerivedStateFromError() {
      return { hasError: true };
   }

   render() {
      if (this.state.hasError) {
         return <div>Đã xảy ra lỗi. Vui lòng thử lại.</div>;
      }
      return this.props.children;
   }
}

export default ErrorBoundary;