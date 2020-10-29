const readline = require("readline");
const fs = require("fs");
const puppeteer = require("puppeteer");

const rs = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const recursive = async () => {
        rs.question("Qual serie você deseja acessar ? [A, B, C, D, E]  ", async serie => {
            if(!["A","B","C","D"].includes(serie.toUpperCase())) {
                console.log("Série inválida!");
                return recursive();
            }

            console.log(`Gerando resultado para a série ${serie.toUpperCase()}`);
            let header = `Gerado: ${new Date().toLocaleDateString("pt-BR", {hour:"numeric", minute:"numeric", second:"numeric"})}\n`;
            header += "------------------------------\n\n"
            header += `Tabela Brasileirão Série ${serie.toUpperCase()}\n\n`    
            await page.goto(`https://globoesporte.globo.com/futebol/brasileirao-serie-${serie.toLowerCase()}/`);
            const result = await page.evaluate(() => {
                let text = "";
                document.querySelectorAll(".classificacao__tabela--linha").forEach((linha, index) => {
                    let item = linha.querySelector(".classificacao__equipes--time > strong");
    
                    if(item) {
                        let pontuacao = document.querySelectorAll(".classificacao__pontos--ponto")[index];
                        text += `${++index}º ${item.innerText}`; 
    
                        if(pontuacao)  {
                            text += ` - ${pontuacao.innerText} pontos`;
                        }                
                        text += `\n`;
                    }
                });
    
                return text;
            });
    
            fs.writeFileSync(`tabela-brasileirao-serie${serie.toUpperCase()}.txt`, header.concat(result));
            await browser.close().then(rs.close());        
        });
    }    

    recursive();
})()