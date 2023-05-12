package de.isuret.polos.AetherOnePi.service;

import de.isuret.polos.AetherOnePi.domain.RadionicScript;
import de.isuret.polos.AetherOnePi.processing2.AetherOneUI;
import org.apache.commons.io.FileUtils;

import java.io.File;

public class RadionicsScriptService {

    private AetherOneUI p;

    public RadionicsScriptService(AetherOneUI p) {
        this.p = p;
    }

    public RadionicScript executeScript(String scriptName) {
        try {
            File file = p.getDataService().getScripts().get(scriptName + ".rscript");

            if (null == file || !file.exists()) {
                System.err.println("Script " + scriptName + " does not exist!");
                return null;
            }

            RadionicScript script = new RadionicScript(FileUtils.readLines(file, "UTF-8"));

            for (int i = 0; i < script.getLines().size(); ) {
                i = executeLine(script, script.getLines().get(i), i);
            }

            return script;
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    private int executeLine(RadionicScript script, String line, int pos) {

        if (line.startsWith("PRINT ")) {
            String output = line.substring("PRINT ".length());
            System.out.println(output);
            script.getOutput().add(output);
            return pos + 1;
        }

        // comments are ignored
        if (line.startsWith("## ")) {
            return pos + 1;
        }

        if (line.startsWith("GOTO ")) {
            String label = line.substring("GOTO ".length());
            Integer newPos = script.getLabelPosition(label);
            if (newPos != null) {
                System.out.println(line);
                return newPos;
            } else {
                String errMsg = "GOTO LABEL " + label + " DOES NOT EXIST";
                System.err.println(errMsg);
                script.getErrorMessages().add(errMsg);
                return pos + 1;
            }
        }

        // labels are ignored
        if (line.contains(":")) {
            return pos + 1;
        }

        if (line.contains("=")) {

        }

        script.getErrorMessages().add(line);
        System.err.println("NON INTERPRETED LINE >> " + line);
        return pos + 1;
    }
}
