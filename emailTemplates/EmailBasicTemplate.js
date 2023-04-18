module.exports = `
<html lang="en">
<head>
    <title>$(page_title)</title>
    <style type="text/css">
        body {
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 0;
            display: flex;
            font-family: Hind, Arial, serif;
            font-size: 16px;
            background-color: #fff1f0;
        }

        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }

        a {
            text-decoration: none;
            color: #00b4ff;
        }

        img {
            width: 100%;
            height: 100%;
        }

        .container {
            max-width: 20rem;
            width: 20rem;
            margin: auto;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border-radius: 0.5rem;
            box-shadow: 0 .05rem 1rem 0.05rem rgba(20, 20, 20, .15);
        }

        .header {
            width: 100%;
            margin: auto 0 auto;
            padding: 1rem 3rem;
            background-color: #00b4ff;
            text-align: center;
            color: #fff;
        }

        .title {
            padding-top: 0.5rem;
            font-size: 2rem;
            line-height: 1;
        }

        .subtitle {
            font-size: 1rem;
            line-height: 1;
        }

        .body {
            width: 100%;
            padding: 1.25rem;
            background-color: #fff;
            font-size: 1rem;
            text-align: left;
            color: #000;
        }

        .hi-msg {
            font-size: 1.25rem;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 0.5rem;
        }

        .regards-msg {
            margin-top: 0.75rem;
            font-size: 0.85rem;
        }

        .footer {
            width: 100%;
            padding: 1rem;
            background-color: transparent;
            font-size: 0.8rem;
            text-align: center;
            color: #707376;
        }

        .text-capitalize {
            text-transform: capitalize;
        }

        .text-transform-none {
            text-transform: none;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <p class="title"><strong>REHUBCY</strong></p>
        <p class="subtitle">$(action_name)</p>
    </div>
    <div class="body">
        <p class="hi-msg"><strong>Hi, <span class="text-capitalize">$(receiver)</span></strong></p>
        $(body_content)
        <p class="regards-msg">Regards, $(sender)</p>
    </div>
    <div class="footer">
        <br>
        <strong>Rehubcy</strong>
    </div>
</div>
</body>
</html>
`;
