package com.syed.intellidocs.service;

import com.syed.intellidocs.exception.PdfProcessingException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;

@Service
public class PdfTextExtractorService {

    public String extractText(Path pdfPath) {
        try(PDDocument document = Loader.loadPDF(pdfPath.toFile())){

            PDFTextStripper textStripper = new PDFTextStripper();
            return textStripper.getText(document);
        } catch (IOException e) {
            throw new PdfProcessingException("Failed to extract text from PDF", e);
        }

    }
}
