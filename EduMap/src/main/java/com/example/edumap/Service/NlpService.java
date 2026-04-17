package com.example.edumap.Service;

import edu.stanford.nlp.ling.CoreLabel;
import edu.stanford.nlp.pipeline.CoreDocument;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
public class NlpService {
        private final StanfordCoreNLP pipeline;

        public NlpService() {
            Properties props = new Properties();
            props.setProperty("annotators", "tokenize,ssplit,pos,lemma");
            this.pipeline = new StanfordCoreNLP(props);
        }

        public String lemmatize(String text) {
            CoreDocument document = new CoreDocument(text);
            pipeline.annotate(document);

            StringBuilder result = new StringBuilder();

            for (CoreLabel token : document.tokens()) {
                if (result.length() > 0) {
                    result.append(" ");
                }
                result.append(token.lemma().toLowerCase());
            }

            return result.toString();
        }
}
