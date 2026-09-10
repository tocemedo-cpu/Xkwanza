-- DropIndex
-- O nome de uma categoria deixa de ser globalmente único — só o slug continua a ser.
-- Isto permite reutilizar o mesmo nome (ex: "Acessórios") em ramos diferentes da árvore;
-- a app garante unicidade entre irmãos.
DROP INDEX "categories_name_key";
