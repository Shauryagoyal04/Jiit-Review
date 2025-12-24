import fs from "fs";
import { PDFParse } from 'pdf-parse';

const dataBuffer = fs.readFileSync("./studentChoicereport.pdf");

const extract = async () => {
    const parser = new PDFParse({data : dataBuffer});
    const data = await parser.getText();
  fs.writeFileSync("rawSubject.txt", data.text);
  console.log("Raw text extracted to rawSubject.txt");
};

extract();
