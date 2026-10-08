package com.syed.intellidocs.service;

import com.syed.intellidocs.exception.PdfProcessingException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class PdfTextExtractorService {

    public String extractText(byte[] pdfBytes) {

        try (
                PDDocument document =
                        Loader.loadPDF(pdfBytes)
        ) {

            PDFTextStripper textStripper =
                    new PDFTextStripper();

            return textStripper.getText(
                    document
            );

        } catch (IOException ex) {
            throw new PdfProcessingException(
                    "Failed to extract text from PDF",
                    ex
            );
        }
    }
}