import React from 'react';
import styled from 'styled-components';

const Form = () => {
  return (
    <StyledWrapper>
      <div className="container">
        <div className="card cart">
          <label className="title">CHECKOUT</label>
          <div className="steps">
            <div className="step">
              <div>
                <span>SHIPPING</span>
                <p>221B Baker Street, W1U 8ED</p>
                <p>London, United Kingdom</p>
              </div>
              <hr />
              <div>
                <span>PAYMENT METHOD</span>
                <p>Visa</p>
                <p>**** **** **** 4243</p>
              </div>
              <hr />
              <div className="promo">
                <span>HAVE A PROMO CODE?</span>
                <form className="form">
                  <input type="text" placeholder="Enter a Promo Code" className="input_field" />
                  <button>Apply</button>
                </form>
              </div>
              <hr />
              <div className="payments">
                <span>PAYMENT</span>
                <div className="details">
                  <span>Subtotal:</span>
                  <span>$240.00</span>
                  <span>Shipping:</span>
                  <span>$10.00</span>
                  <span>Tax:</span>
                  <span>$30.40</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card checkout">
          <div className="footer">
            <label className="price">$280.40</label>
            <button className="checkout-btn">Checkout</button>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* Body */
  .container {
    display: grid;
    grid-template-columns: auto;
    gap: 0px;
  }

  hr {
    height: 1px;
    background-color: rgba(16, 86, 82, .75);
    ;
    border: none;
  }

  .card {
    width: 400px;
    background: rgb(255, 250, 235);
    box-shadow: 0px 187px 75px rgba(0, 0, 0, 0.01), 0px 105px 63px rgba(0, 0, 0, 0.05), 0px 47px 47px rgba(0, 0, 0, 0.09), 0px 12px 26px rgba(0, 0, 0, 0.1), 0px 0px 0px rgba(0, 0, 0, 0.1);
  }

  .title {
    width: 100%;
    height: 40px;
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 20px;
    border-bottom: 1px solid rgba(16, 86, 82, .75);
    ;
    font-weight: 700;
    font-size: 11px;
    color: #000000;
  }

  /* Cart */
  .cart {
    border-radius: 19px 19px 0px 0px;
  }

  .cart .steps {
    display: flex;
    flex-direction: column;
    padding: 20px;
  }

  .cart .steps .step {
    display: grid;
    gap: 10px;
  }

  .cart .steps .step span {
    font-size: 13px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 8px;
    display: block;
  }

  .cart .steps .step p {
    font-size: 11px;
    font-weight: 600;
    color: #000000;
  }

  /* Promo */
  .promo form {
    display: grid;
    grid-template-columns: 1fr 80px;
    gap: 10px;
    padding: 0px;
  }

  .input_field {
    width: auto;
    height: 36px;
    padding: 0 0 0 12px;
    border-radius: 5px;
    outline: none;
    border: 1px solid  rgb(16, 86, 82);
    background-color: rgb(251, 243, 228);
    transition: all 0.3s cubic-bezier(0.15, 0.83, 0.66, 1);
  }

  .input_field:focus {
    border: 1px solid transparent;
    box-shadow: 0px 0px 0px 2px rgb(251, 243, 228);
    background-color: rgb(201, 193, 178);
  }

  .promo form button {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 10px 18px;
    gap: 10px;
    width: 100%;
    height: 36px;
    background: rgba(16, 86, 82, .75);
    box-shadow: 0px 0.5px 0.5px #F3D2C9, 0px 1px 0.5px rgba(239, 239, 239, 0.5);
    border-radius: 5px;
    border: 0;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 15px;
    color: #000000;
  }

  /* Checkout */
  .payments .details {
    display: grid;
    grid-template-columns: 10fr 1fr;
    padding: 0px;
    gap: 5px;
  }

  .payments .details span:nth-child(odd) {
    font-size: 12px;
    font-weight: 600;
    color: #000000;
    margin: auto auto auto 0;
  }

  .payments .details span:nth-child(even) {
    font-size: 13px;
    font-weight: 600;
    color: #000000;
    margin: auto 0 auto auto;
  }

  .checkout .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 10px 10px 20px;
    background-color: rgba(16, 86, 82, .5);
  }

  .price {
    position: relative;
    font-size: 22px;
    color: #2B2B2F;
    font-weight: 900;
  }

  .checkout .checkout-btn {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 150px;
    height: 36px;
    background: rgba(16, 86, 82, .55);
    box-shadow: 0px 0.5px 0.5px rgba(16, 86, 82, .75), 0px 1px 0.5px rgba(16, 86, 82, .75);
    ;
    border-radius: 7px;
    border: 1px solid rgb(16, 86, 82);
    ;
    color: #000000;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.15, 0.83, 0.66, 1);
  }`;

export default Form;
