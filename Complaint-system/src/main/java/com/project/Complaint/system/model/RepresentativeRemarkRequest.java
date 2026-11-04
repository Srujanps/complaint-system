package com.project.Complaint.system.model;

public class RepresentativeRemarkRequest {
    private String remark;

    public RepresentativeRemarkRequest() {}

    public RepresentativeRemarkRequest(String remark) {
        this.remark = remark;
    }

    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
}
