export default (req, res) => {
  res.write(
    `
    <div>
    <style>
    div{
    animation:bounce 2s infinite;
    height: 100px;
    width: 100px;
    background-color: #4CAF50;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    </style>
    <div>Hello World</div>
    </div>
    `,
  );
  return res.end();
};
