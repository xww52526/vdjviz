package graph.AnnotationTable;

import com.antigenomics.vdjtools.sample.Clonotype;

public class AnnotationTableCdr {

    public String cdr3aa;
    public String cdr3nt;
    public Integer vend;
    public Integer jstart;
    public Integer dstart;
    public Integer dend;


    public AnnotationTableCdr(Clonotype clonotype) {
        this.cdr3aa = clonotype.getCdr3aa();
        this.cdr3nt = clonotype.getCdr3nt();
        this.vend = clonotype.getVEnd();
        this.jstart = clonotype.getJStart();
        this.dstart = clonotype.getDStart();
        this.dend = clonotype.getDEnd();
    }

}
