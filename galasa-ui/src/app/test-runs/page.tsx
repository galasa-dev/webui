/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import PageTile from "@/components/PageTile";
import BreadCrumb from "@/components/common/BreadCrumb";
import styles from "@/styles/TestRunsPage.module.css";
import { useTranslations } from "next-intl";


export default function TestRunsPage() {
  const t=useTranslations('TestRun');
  return (
    <main id="content">
      <BreadCrumb />
      <PageTile title={t("title")} />
      <div className={styles.testRunsContentWrapper}>
        <p className={styles.underConstruction}>
          {t("underConstruction")}
        </p>
      </div>
    </main>   
  );
};
